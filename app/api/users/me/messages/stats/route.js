import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Query } from "node-appwrite";

export async function GET() {
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

    // Create admin client for secure operations
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    // Get user ID from session
    const userId = sessionData.userId;

    // Get message count for the user
    const { total: messageCount } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
      [
        Query.equal("sender_id", userId),
        Query.limit(1), // We only need the count
      ]
    );

    // Get groups where user is a member
    const { documents: userGroups } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      [
        Query.search("members", userId),
        Query.limit(100), // Reasonable limit for user groups
      ]
    );

    const stats = {
      messagesSent: messageCount,
      groupsJoined: userGroups.length,
      total_messages: messageCount, // Keep for backwards compatibility
      groups_joined: userGroups.length, // Keep for backwards compatibility
      active_conversations: userGroups.length, // Simplified metric
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Get user message stats error:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to fetch message statistics" },
      { status: 500 }
    );
  }
}
