import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Users, ID } from "node-appwrite";

export async function POST(request, { params }) {
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

    // Create admin client for secure operations
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);
    const users = new Users(adminClient);

    // Get user ID from session
    const userId = sessionData.userId;

    // Get group
    const group = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      groupId
    );

    // Check if already a member
    if (group.members?.includes(userId)) {
      return NextResponse.json(
        { detail: "Already a member of this group" },
        { status: 400 }
      );
    }

    // Add user to members array
    const updatedMembers = [...(group.members || []), userId];

    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      groupId,
      {
        members: updatedMembers,
      }
    );

    // Add user to group_members collection
    try {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_GROUP_MEMBERS_COLLECTION_ID ||
          "group_members",
        ID.unique(),
        {
          group_id: groupId,
          user_id: userId,
          role: "member", // Regular member role
          joined_at: new Date().toISOString(),
        }
      );
      console.log("User added to group_members");
    } catch (error) {
      console.error("Error adding user to group_members:", error);
      // Don't fail the whole request if this fails
    }

    // Get user details for system message
    const user = await users.get(userId);
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

    // Create system message for join
    try {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          content: `${userName} joined the group`,
          group_id: groupId,
          sender_id: "system",
          sender_name: "System",
          timestamp: new Date().toISOString(),
          is_system_message: true,
          system_message_type: "join",
          system_message_user: userId,
        }
      );
    } catch (error) {
      console.log("Failed to create system message:", error);
    }

    return NextResponse.json({
      message: "Successfully joined the group",
    });
  } catch (error) {
    console.error("Join group error:", error);
    if (error.code === 404) {
      return NextResponse.json({ detail: "Group not found" }, { status: 404 });
    }
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
