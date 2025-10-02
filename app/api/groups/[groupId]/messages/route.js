import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Users, Query } from "node-appwrite";

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      return NextResponse.json(
        { detail: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse session data
    let sessionData;
    try {
      sessionData = JSON.parse(session.value);
    } catch {
      return NextResponse.json(
        { detail: "Invalid session format, please login again" },
        { status: 401 }
      );
    }

    const { groupId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Create admin client for secure operations
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);
    const users = new Users(adminClient);

    // Get user ID from session
    const userId = sessionData.userId;

    // Get group to check membership
    const group = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      groupId
    );

    // Check if user is a member
    if (!group.members?.includes(userId)) {
      return NextResponse.json(
        { detail: "Not a member of this group" },
        { status: 403 }
      );
    }

    // Get messages for the group
    const { documents: messages } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
      [
        Query.equal("group_id", groupId),
        Query.orderAsc("timestamp"),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    const messageResponses = messages.map(message => ({
      id: message.$id,
      content: message.content,
      group_id: message.group_id,
      sender_id: message.sender_id,
      sender_name: message.sender_name,
      timestamp: message.timestamp,
    }));

    return NextResponse.json(messageResponses);
  } catch (error) {
    console.error("Get messages error:", error);
    if (error.code === 404) {
      return NextResponse.json({ detail: "Group not found" }, { status: 404 });
    }
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
