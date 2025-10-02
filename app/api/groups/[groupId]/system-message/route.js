import { NextResponse } from "next/server";
import { Client, Databases, ID } from "node-appwrite";

export async function POST(request, { params }) {
  try {
    const { groupId } = await params;
    const { type, userId, userName } = await request.json();

    // Create admin client for secure operations
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    // Create system message content based on type
    let content = "";
    switch (type) {
      case "join":
        content = `${userName} joined the group`;
        break;
      case "leave":
        content = `${userName} left the group`;
        break;
      default:
        content = `${userName} ${type}`;
    }

    // Create system message
    const message = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
      ID.unique(),
      {
        content,
        group_id: groupId,
        sender_id: "system",
        sender_name: "System",
        timestamp: new Date().toISOString(),
        is_system_message: true,
        system_message_type: type,
        system_message_user: userId,
      }
    );

    return NextResponse.json({
      id: message.$id,
      content: message.content,
      group_id: message.group_id,
      sender_id: message.sender_id,
      sender_name: message.sender_name,
      timestamp: message.timestamp,
      is_system_message: true,
      system_message_type: type,
    });
  } catch (error) {
    console.error("Create system message error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
