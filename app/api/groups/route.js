import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Users, Query } from "node-appwrite";

// GET /api/groups - Get all groups (public groups list)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Create admin client for secure operations
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    // Get public groups
    const { documents: groups } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      [Query.orderDesc("$createdAt"), Query.limit(limit), Query.offset(offset)]
    );

    const groupsList = groups.map(group => ({
      id: group.$id,
      name: group.name,
      description: group.description,
      subject: group.subject,
      member_count: group.members?.length || 0,
      creator_id: group.creator_id,
      created_at: group.$createdAt,
    }));

    return NextResponse.json(groupsList);
  } catch (error) {
    console.error("Get groups error:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to fetch groups" },
      { status: 500 }
    );
  }
}
