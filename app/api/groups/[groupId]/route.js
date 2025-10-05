import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Query } from "node-appwrite";

export async function GET(req, { params }) {
  try {
    const { groupId } = params;

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
    const userId = sessionData.userId;

    // Fetch group details
    const group = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      "groups",
      groupId
    );

    // Fetch member count
    const membersResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      "group_members",
      [Query.equal("group_id", groupId), Query.limit(1000)]
    );

    // Fetch message count
    const messagesResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      "messages",
      [Query.equal("group_id", groupId), Query.limit(1)]
    );

    // Fetch file count
    const filesResponse = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      "group_files",
      [Query.equal("group_id", groupId), Query.limit(1)]
    );

    // Combine data
    const groupWithStats = {
      ...group,
      id: group.$id,
      members: membersResponse.documents,
      member_count: membersResponse.total, // Add total member count
      message_count: messagesResponse.total,
      file_count: filesResponse.total,
    };

    return NextResponse.json(groupWithStats);
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch group" },
      { status: 500 }
    );
  }
}
