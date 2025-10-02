import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Account, Databases, ID, Query } from "node-appwrite";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      return NextResponse.json(
        { detail: "Not authenticated" },
        { status: 401 }
      );
    }

    const { name, description, is_public } = await request.json();

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { detail: "Group name is required" },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { detail: "Group name must be less than 100 characters" },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { detail: "Description must be less than 500 characters" },
        { status: 400 }
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

    // Create admin client for secure operations
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    // Get user ID from session
    const userId = sessionData.userId;

    // Get user profile for name
    let userName = "User";
    try {
      const profile = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
        userId
      );
      userName = profile.name;
    } catch (error) {
      console.log("Profile not found, using account name");
    }

    // Create group document
    const group = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      ID.unique(),
      {
        name: name.trim(),
        description: description ? description.trim() : "",
        is_public: is_public !== undefined ? is_public : true,
        creator_id: userId,
        members: [userId],
        created_at: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      id: group.$id,
      name: group.name,
      description: group.description,
      is_public: group.is_public,
      creator_id: group.creator_id,
      member_count: 1,
      is_member: true,
      created_at: group.created_at,
    });
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
