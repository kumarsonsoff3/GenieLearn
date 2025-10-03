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

    // Get all groups
    const { documents: allGroups } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      [Query.limit(1000)]
    );

    // Filter groups where user is a member
    const userGroups = allGroups.filter(group =>
      group.members?.includes(userId)
    );

    // Enrich groups with creator info
    const enrichedGroups = await Promise.all(
      userGroups.map(async group => {
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
          is_member: true,
          created_at: group.created_at,
        };
      })
    );

    return NextResponse.json(enrichedGroups);
  } catch (error) {
    console.error("Get user groups error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
