import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Storage } from "node-appwrite";

export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      return NextResponse.json(
        { detail: "Not authenticated" },
        { status: 401 }
      );
    }

    const { fileId, groupId } = params;

    // Parse session data to get user ID
    let sessionData;
    try {
      sessionData = JSON.parse(session.value);
    } catch {
      return NextResponse.json(
        { detail: "Invalid session format" },
        { status: 401 }
      );
    }

    const currentUserId = sessionData.userId;

    // Create admin client
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);
    const storage = new Storage(adminClient);

    // Get file details first
    const file = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUP_FILES_COLLECTION_ID,
      fileId
    );

    // Get group details
    const group = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      groupId
    );

    // Check if user is the file uploader or group creator
    const isUploader = file.uploaded_by === currentUserId;
    const isGroupCreator = group.creator_id === currentUserId;

    if (!isUploader && !isGroupCreator) {
      return NextResponse.json(
        { detail: "You don't have permission to delete this file" },
        { status: 403 }
      );
    }

    // Delete from storage first
    try {
      const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "files";
      await storage.deleteFile(bucketId, file.file_id);
    } catch (storageError) {
      // Continue even if storage deletion fails (file might already be deleted)
      console.error("Storage deletion error:", storageError);
    }

    // Delete file record from database
    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUP_FILES_COLLECTION_ID,
      fileId
    );

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to delete file" },
      { status: 500 }
    );
  }
}
