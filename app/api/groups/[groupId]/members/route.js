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

    // Get group to access members array
    const group = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      groupId
    );

    // Fetch member details from user_profiles
    const memberProfiles = [];
    for (const memberId of group.members || []) {
      try {
        const profile = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
          memberId
        );
        memberProfiles.push({
          $id: profile.$id,
          user_id: profile.user_id || profile.userId,
          name: profile.name || profile.display_name,
          email: profile.email,
          role: memberId === group.creator_id ? "creator" : "member",
          joined_at: profile.created_at,
        });
      } catch (error) {
        console.error(`Error fetching profile for member ${memberId}:`, error);
      }
    }

    return NextResponse.json(memberProfiles);
  } catch (error) {
    console.error("Error fetching group members:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to fetch members" },
      { status: 500 }
    );
  }
}
