import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, ID, Query } from "node-appwrite";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
      return NextResponse.json(
        { detail: "Not authenticated" },
        { status: 401 }
      );
    }

    // Create admin client
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);

    // Get all groups
    const { documents: groups } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      "groups",
      [Query.limit(1000)]
    );

    let fixed = 0;
    let errors = 0;

    // For each group, add creator to group_members if not already there
    for (const group of groups) {
      try {
        // Check if creator already exists in group_members
        const existing = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          "group_members",
          [
            Query.equal("group_id", group.$id),
            Query.equal("user_id", group.creator_id),
            Query.limit(1),
          ]
        );

        if (existing.documents.length === 0) {
          // Add creator as admin
          await databases.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            "group_members",
            ID.unique(),
            {
              group_id: group.$id,
              user_id: group.creator_id,
              role: "admin",
              joined_at: group.created_at || new Date().toISOString(),
            }
          );
          fixed++;
          console.log(`Fixed group: ${group.name} (${group.$id})`);
        }
      } catch (error) {
        console.error(`Error fixing group ${group.$id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      message: "Migration completed",
      groups_processed: groups.length,
      groups_fixed: fixed,
      errors: errors,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to migrate" },
      { status: 500 }
    );
  }
}
