import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Users, ID } from "node-appwrite";

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

    const { content, group_id } = await request.json();

    // Validation
    if (!content || !content.trim()) {
      return NextResponse.json(
        { detail: "Message content is required" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { detail: "Message must be less than 1000 characters" },
        { status: 400 }
      );
    }

    if (!group_id) {
      return NextResponse.json(
        { detail: "Group ID is required" },
        { status: 400 }
      );
    }

    // Create admin client for secure operations
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);
    const users = new Users(adminClient);

    // Get user ID from session
    const userId = sessionData.userId;

    // Get current user
    const user = await users.get(userId);

    // Get user name
    let userName = user.name;
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

    // Check if user is a member of the group
    const group = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      group_id
    );

    if (!group.members?.includes(userId)) {
      return NextResponse.json(
        { detail: "Not a member of this group" },
        { status: 403 }
      );
    }

    // Create message
    const message = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
      ID.unique(),
      {
        content: content.trim(),
        group_id,
        sender_id: userId,
        sender_name: userName,
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      id: message.$id,
      content: message.content,
      group_id: message.group_id,
      sender_id: message.sender_id,
      sender_name: message.sender_name,
      timestamp: message.timestamp,
    });
  } catch (error) {
    console.error("Create message error:", error);
    if (error.code === 404) {
      return NextResponse.json({ detail: "Group not found" }, { status: 404 });
    }
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
