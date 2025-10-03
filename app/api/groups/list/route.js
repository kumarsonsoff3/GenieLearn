import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Account, Databases, Query } from "node-appwrite";

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

    // Get all public groups
    const { documents: groups } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      [
        Query.equal("is_public", true),
        Query.orderDesc("created_at"),
        Query.limit(100),
      ]
    );

    // Enrich groups with creator info and membership status
    const enrichedGroups = await Promise.all(
      groups.map(async group => {
        let creatorName = "Unknown";
        try {
          const profile = await databases.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
            group.creator_id
          );
          creatorName = profile.name;
        } catch (error) {
          console.log("Creator profile not found");
        }

        return {
          id: group.$id,
          name: group.name,
          description: group.description,
          is_public: group.is_public,
          creator_id: group.creator_id,
          creator_name: creatorName,
          member_count: group.members?.length || 0,
          is_member: group.members?.includes(userId) || false,
          created_at: group.created_at,
        };
      })
    );

    return NextResponse.json(enrichedGroups);
  } catch (error) {
    console.error("List groups error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
