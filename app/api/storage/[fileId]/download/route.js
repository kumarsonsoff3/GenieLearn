import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Storage } from "node-appwrite";

export async function GET(request, { params }) {
  try {
    console.log("=== Storage Download Request ===");

    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    console.log("Session exists:", !!session);

    if (!session) {
      console.error("No session cookie");
      return NextResponse.json(
        { detail: "Not authenticated" },
        { status: 401 }
      );
    }

    const { fileId } = await params;
    console.log("File ID requested:", fileId);

    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "files";
    console.log("Bucket ID:", bucketId);

    // Create admin client
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const storage = new Storage(adminClient);

    // Verify file exists
    try {
      const file = await storage.getFile(bucketId, fileId);
      console.log("File found in storage:", file.$id);
    } catch (error) {
      console.error("File not found in storage:", error.message);
      return NextResponse.json(
        { detail: "File not found", code: error.code },
        { status: 404 }
      );
    }

    // Generate the download URL
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const downloadUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}`;

    console.log("Redirecting to:", downloadUrl);

    // Redirect to the download URL
    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error("Storage download error:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to download file" },
      { status: 500 }
    );
  }
}
