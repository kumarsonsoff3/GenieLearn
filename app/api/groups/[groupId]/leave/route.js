import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Users, Storage, Query } from "node-appwrite";

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

    const { groupId } = await params;

    // Create admin client for secure operations
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);
    const users = new Users(adminClient);
    const storage = new Storage(adminClient);

    // Get user ID from session
    const userId = sessionData.userId;

    // Get group
    const group = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      groupId
    );

    // Check if user is a member
    if (!group.members?.includes(userId)) {
      return NextResponse.json(
        { detail: "You are not a member of this group" },
        { status: 400 }
      );
    }

    // Prevent creator from leaving if there are other members
    if (group.creator_id === userId && group.members.length > 1) {
      return NextResponse.json(
        { detail: "Group creator cannot leave while there are other members" },
        { status: 400 }
      );
    }

    // Remove user from members array
    const updatedMembers = group.members.filter(id => id !== userId);

    // Delete the group if no members are left
    if (updatedMembers.length === 0) {
      console.log(`Deleting group ${groupId} and all related data...`);

      // ============================================================
      // COMPREHENSIVE GROUP CLEANUP
      // When a group is deleted, we must remove all associated data:
      // 1. Files (from storage bucket and database)
      // 2. Member records (from group_members collection)
      // 3. Messages (from messages collection)
      // 4. Group document (from groups collection)
      // ============================================================

      try {
        // 1. Delete all files from storage and file records
        const { documents: files } = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_GROUP_FILES_COLLECTION_ID ||
            "group_files",
          [Query.equal("group_id", groupId), Query.limit(1000)]
        );

        console.log(`Found ${files.length} files to delete`);
        for (const file of files) {
          try {
            // Delete from storage bucket
            if (file.file_id) {
              await storage.deleteFile(
                process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "files",
                file.file_id
              );
              console.log(`Deleted file from storage: ${file.file_id}`);
            }
          } catch (error) {
            console.error(
              `Error deleting file ${file.file_id} from storage:`,
              error
            );
          }

          try {
            // Delete file record from database
            await databases.deleteDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
              process.env.NEXT_PUBLIC_APPWRITE_GROUP_FILES_COLLECTION_ID ||
                "group_files",
              file.$id
            );
            console.log(`Deleted file record: ${file.$id}`);
          } catch (error) {
            console.error(`Error deleting file record ${file.$id}:`, error);
          }
        }

        // 2. Delete all member records from group_members collection
        const { documents: memberRecords } = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_GROUP_MEMBERS_COLLECTION_ID ||
            "group_members",
          [Query.equal("group_id", groupId), Query.limit(1000)]
        );

        console.log(`Found ${memberRecords.length} member records to delete`);
        for (const memberRecord of memberRecords) {
          try {
            await databases.deleteDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
              process.env.NEXT_PUBLIC_APPWRITE_GROUP_MEMBERS_COLLECTION_ID ||
                "group_members",
              memberRecord.$id
            );
            console.log(`Deleted member record: ${memberRecord.$id}`);
          } catch (error) {
            console.error(
              `Error deleting member record ${memberRecord.$id}:`,
              error
            );
          }
        }

        // 3. Delete all messages
        const { documents: messages } = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
          [Query.equal("group_id", groupId), Query.limit(1000)]
        );

        console.log(`Found ${messages.length} messages to delete`);
        for (const message of messages) {
          try {
            await databases.deleteDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
              process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
              message.$id
            );
            console.log(`Deleted message: ${message.$id}`);
          } catch (error) {
            console.error(`Error deleting message ${message.$id}:`, error);
          }
        }

        // 4. Finally, delete the group itself
        await databases.deleteDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
          groupId
        );
        console.log(`Deleted group: ${groupId}`);

        return NextResponse.json({
          message:
            "Successfully left the group. Group and all related data were deleted as it had no remaining members.",
        });
      } catch (error) {
        console.error("Error during group cleanup:", error);
        // Even if cleanup fails, try to delete the group
        try {
          await databases.deleteDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
            groupId
          );
        } catch (deleteError) {
          console.error("Failed to delete group:", deleteError);
        }
        throw error;
      }
    } else {
      // Get user details for system message
      const user = await users.get(userId);
      let userName = user.name;

      try {
        const profile = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
          userId
        );
        userName = profile.name;
      } catch (error) {
        console.log("Profile not found, using account name");
      }

      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
        groupId,
        {
          members: updatedMembers,
        }
      );

      // Delete member record from group_members collection
      try {
        const { documents: memberRecords } = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_GROUP_MEMBERS_COLLECTION_ID ||
            "group_members",
          [
            Query.equal("group_id", groupId),
            Query.equal("user_id", userId),
            Query.limit(1),
          ]
        );

        if (memberRecords.length > 0) {
          await databases.deleteDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_GROUP_MEMBERS_COLLECTION_ID ||
              "group_members",
            memberRecords[0].$id
          );
          console.log(`Deleted member record for user ${userId}`);
        }
      } catch (error) {
        console.error("Error deleting member record:", error);
        // Don't fail the whole request if this fails
      }

      // Create system message for leave
      try {
        await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
          ID.unique(),
          {
            content: `${userName} left the group`,
            group_id: groupId,
            sender_id: "system",
            sender_name: "System",
            timestamp: new Date().toISOString(),
            is_system_message: true,
            system_message_type: "leave",
            system_message_user: userId,
          }
        );
      } catch (error) {
        console.log("Failed to create system message:", error);
      }

      return NextResponse.json({
        message: "Successfully left the group",
      });
    }
  } catch (error) {
    console.error("Leave group error:", error);
    if (error.code === 404) {
      return NextResponse.json({ detail: "Group not found" }, { status: 404 });
    }
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
