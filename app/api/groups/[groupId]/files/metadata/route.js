import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Client, Databases, ID, Query } from "node-appwrite";

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

    const { groupId } = await params;

    // Parse session data
    let sessionData;
    try {
      sessionData = JSON.parse(session.value);
    } catch {
      return NextResponse.json(
        { detail: "Invalid session format" },
        { status: 401 }
      );
    }

    const userId = sessionData.userId;

    // Get metadata from request body
    const {
      file_id,
      filename,
      original_name,
      file_type,
      file_size,
      description,
    } = await request.json();

    if (!file_id || !filename) {
      return NextResponse.json(
        { detail: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create admin client
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    console.log("Creating file metadata record...");

    // Create file record in database
    const fileDoc = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUP_FILES_COLLECTION_ID,
      ID.unique(),
      {
        file_id: file_id,
        group_id: groupId,
        uploaded_by: userId,
        filename: filename,
        original_name: original_name,
        file_type: file_type,
        file_size: file_size,
        description: description || "",
        uploaded_at: new Date().toISOString(),
        upload_date: new Date().toISOString(),
      }
    );

    console.log("File metadata created:", fileDoc.$id);

    // Add uploader name to response
    let uploaderName = "Unknown";
    try {
      const userProfile = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
        [Query.equal("user_id", userId), Query.limit(1)]
      );

      if (userProfile.documents.length > 0) {
        const profile = userProfile.documents[0];
        uploaderName = profile.full_name || profile.name || "Unknown";
      }
    } catch (err) {
      console.error("Could not fetch uploader name:", err);
    }

    return NextResponse.json({
      ...fileDoc,
      uploaded_by_name: uploaderName,
    });
  } catch (error) {
    console.error("Error creating file metadata:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to create file metadata" },
      { status: 500 }
    );
  }
}
