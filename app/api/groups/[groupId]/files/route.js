import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Query } from "node-appwrite";

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      return NextResponse.json(
        { detail: "Not authenticated" },
        { status: 401 },
      );
    }

    const { groupId } = await params;

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
      ],
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
              [Query.equal("user_id", file.uploaded_by), Query.limit(1)],
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
      }),
    );

    return NextResponse.json(enrichedFiles);
  } catch (error) {
    console.error("Error fetching group files:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to fetch files" },
      { status: 500 },
    );
  }
}
