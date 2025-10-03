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

    // Calculate statistics
    const totalGroups = allGroups.length;
    const publicGroups = allGroups.filter(g => g.is_public);
    const totalPublicGroups = publicGroups.length;

    const userGroups = allGroups.filter(g => g.members?.includes(userId));
    const userJoinedGroups = userGroups.length;

    const publicGroupsJoined = userGroups.filter(g => g.is_public).length;
    const publicGroupsNotJoined = totalPublicGroups - publicGroupsJoined;

    return NextResponse.json({
      totalGroups,
      totalPublicGroups,
      userJoinedGroups,
      publicGroupsJoined,
      publicGroupsNotJoined,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
