import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Query, Storage, ID } from "node-appwrite";

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

    const { groupId } = params;

    // Create admin client
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    // Fetch files for this group
    const { documents: files } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUP_FILES_COLLECTION_ID,
      [
        Query.equal("group_id", groupId),
        Query.orderDesc("uploaded_at"),
        Query.limit(100),
      ]
    );

    // Enrich files with uploader names
    const enrichedFiles = await Promise.all(
      files.map(async file => {
        try {
          if (file.uploaded_by) {
            const userProfile = await databases.listDocuments(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
              process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID ||
                "user_profiles",
              [Query.equal("user_id", file.uploaded_by), Query.limit(1)]
            );

            if (userProfile.documents.length > 0) {
              const profile = userProfile.documents[0];
              return {
                ...file,
                uploaded_by_name:
                  profile.full_name || profile.name || "Unknown",
              };
            }
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
        return file;
      })
    );

    return NextResponse.json(enrichedFiles);
  } catch (error) {
    console.error("Error fetching group files:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    console.log("=== File Upload Starting ===");

    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      console.error("No session found");
      return NextResponse.json(
        { detail: "Not authenticated" },
        { status: 401 }
      );
    }

    const { groupId } = await params;
    console.log("Group ID:", groupId);

    // Parse session data
    let sessionData;
    try {
      sessionData = JSON.parse(session.value);
      console.log("User ID:", sessionData.userId);
    } catch {
      console.error("Invalid session format");
      return NextResponse.json(
        { detail: "Invalid session format" },
        { status: 401 }
      );
    }

    const userId = sessionData.userId;

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file");
    const description = formData.get("description") || "";

    console.log("File received:", file?.name, "Size:", file?.size);

    if (!file) {
      return NextResponse.json({ detail: "No file provided" }, { status: 400 });
    }

    // Create admin client
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);
    const storage = new Storage(adminClient);

    // Convert file to Buffer for node-appwrite
    const fileBuffer = await file.arrayBuffer();
    const fileId = ID.unique();
    console.log("Generated file ID:", fileId);

    // Create a File-like object that node-appwrite can handle
    const uploadFile = new File([fileBuffer], file.name, { type: file.type });

    console.log(
      "Uploading to storage bucket:",
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID
    );

    let uploadedFile;
    try {
      uploadedFile = await storage.createFile(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "files",
        fileId,
        uploadFile
      );
      console.log("File uploaded successfully to storage:", uploadedFile.$id);
    } catch (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { detail: "Failed to upload to storage: " + uploadError.message },
        { status: 500 }
      );
    }

    console.log("Creating database record with file_id:", uploadedFile.$id);

    // Create file record in database
    const fileDoc = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUP_FILES_COLLECTION_ID,
      ID.unique(),
      {
        file_id: uploadedFile.$id,
        group_id: groupId,
        uploaded_by: userId,
        filename: file.name,
        original_name: file.name, // Required by Appwrite schema
        file_type: file.type || "application/octet-stream",
        file_size: file.size,
        description: description,
        uploaded_at: new Date().toISOString(),
        upload_date: new Date().toISOString(), // Required by Appwrite schema
      }
    );

    console.log("Database record created:", fileDoc.$id);
    console.log("File ID in database:", fileDoc.file_id);

    // Add uploader name to response
    let uploaderName = "Unknown";
    try {
      const userProfile = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID ||
          "user_profiles",
        [Query.equal("user_id", userId), Query.limit(1)]
      );

      if (userProfile.documents.length > 0) {
        const profile = userProfile.documents[0];
        uploaderName = profile.full_name || profile.name || "Unknown";
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }

    console.log("Upload complete! Returning document");

    return NextResponse.json({
      ...fileDoc,
      uploaded_by_name: uploaderName,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
