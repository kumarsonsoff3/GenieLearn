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

    // Get group details
    const group = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID,
      groupId,
    );

    // Get total messages
    const { total: totalMessages } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
      [Query.equal("group_id", groupId), Query.limit(1)],
    );

    // Get total files
    const { total: totalFiles } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUP_FILES_COLLECTION_ID,
      [Query.equal("group_id", groupId), Query.limit(1)],
    );

    // Calculate messages this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const { total: messagesThisWeek } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
      [
        Query.equal("group_id", groupId),
        Query.greaterThan("timestamp", oneWeekAgo.toISOString()),
        Query.limit(1),
      ],
    );

    // Calculate files this week
    const { total: filesThisWeek } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_GROUP_FILES_COLLECTION_ID,
      [
        Query.equal("group_id", groupId),
        Query.greaterThan("uploaded_at", oneWeekAgo.toISOString()),
        Query.limit(1),
      ],
    );

    // Calculate average messages per day
    const groupCreatedAt = new Date(group.created_at);
    const daysSinceCreation = Math.max(
      1,
      Math.floor((new Date() - groupCreatedAt) / (1000 * 60 * 60 * 24)),
    );
    const averageMessagesPerDay = totalMessages / daysSinceCreation;

    // Get top contributors (sample - you may want to optimize this)
    const { documents: messages } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
      [Query.equal("group_id", groupId), Query.limit(1000)],
    );

    const contributorMap = {};
    messages.forEach(msg => {
      const senderId = msg.sender_id || msg.user_id;
      if (senderId) {
        if (!contributorMap[senderId]) {
          contributorMap[senderId] = {
            userId: senderId,
            name: msg.sender_name || "Unknown",
            messageCount: 0,
          };
        }
        contributorMap[senderId].messageCount++;
      }
    });

    const topContributors = Object.values(contributorMap)
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, 5);

    // Determine activity trend
    let activityTrend = "stable";
    if (messagesThisWeek > totalMessages * 0.3) {
      activityTrend = "increasing";
    } else if (messagesThisWeek < totalMessages * 0.1) {
      activityTrend = "decreasing";
    }

    return NextResponse.json({
      totalMessages,
      totalFiles,
      totalMembers: group.members?.length || 0,
      messagesThisWeek,
      filesThisWeek,
      newMembersThisWeek: 0, // Would need member join dates to calculate
      mostActiveDay: "N/A", // Would need daily breakdown
      averageMessagesPerDay: Math.round(averageMessagesPerDay * 10) / 10,
      topContributors,
      activityTrend,
      engagementRate:
        totalMessages > 0
          ? `${Math.round(
              (topContributors.length / (group.members?.length || 1)) * 100,
            )}%`
          : "0%",
      activeMembers: topContributors.length,
      activeDays: daysSinceCreation,
    });
  } catch (error) {
    console.error("Error fetching group insights:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to fetch insights" },
      { status: 500 },
    );
  }
}
