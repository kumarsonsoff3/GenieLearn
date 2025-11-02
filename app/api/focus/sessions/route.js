import { NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite-server";
import { cookies } from "next/headers";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const SESSIONS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_FOCUS_SESSIONS_COLLECTION_ID;
const PROFILES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID;

// Helper to verify session and get user
async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session?.value) {
      return null;
    }

    const sessionData = JSON.parse(session.value);
    return sessionData.userId;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

// GET - Fetch user's focus sessions
export async function GET(request) {
  try {
    const userId = await getAuthenticatedUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 50;
    const offset = parseInt(searchParams.get("offset")) || 0;

    const { databases } = createAdminClient();
    const sessions = await databases.listDocuments(
      DATABASE_ID,
      SESSIONS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("createdAt"),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("Error fetching focus sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch focus sessions" },
      { status: 500 }
    );
  }
}

// POST - Create a new focus session
export async function POST(request) {
  try {
    const userId = await getAuthenticatedUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      duration,
      completedMinutes,
      backgroundId,
      isCompleted = false,
    } = body;

    // Validate required fields
    if (!duration || completedMinutes === undefined) {
      return NextResponse.json(
        { error: "Duration and completedMinutes are required" },
        { status: 400 }
      );
    }

    const { databases } = createAdminClient();

    // Create focus session
    const session = await databases.createDocument(
      DATABASE_ID,
      SESSIONS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        duration: parseInt(duration),
        completedMinutes: parseInt(completedMinutes),
        backgroundId: backgroundId || "creative_flow",
        isCompleted,
        createdAt: new Date().toISOString(),
      }
    );

    // Update user's total study minutes
    if (completedMinutes > 0) {
      try {
        // Fetch current profile
        const profiles = await databases.listDocuments(
          DATABASE_ID,
          PROFILES_COLLECTION_ID,
          [Query.equal("userId", userId), Query.limit(1)]
        );

        if (profiles.documents.length > 0) {
          const profile = profiles.documents[0];
          const currentTotal = profile.totalStudyMinutes || 0;
          const newTotal = currentTotal + parseInt(completedMinutes);

          await databases.updateDocument(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            profile.$id,
            {
              totalStudyMinutes: newTotal,
            }
          );
        }
      } catch (profileError) {
        console.error("Error updating profile study minutes:", profileError);
        // Don't fail the request if profile update fails
      }
    }

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("Error creating focus session:", error);
    return NextResponse.json(
      { error: "Failed to create focus session" },
      { status: 500 }
    );
  }
}

// PATCH - Update an existing focus session (for ongoing sessions)
export async function PATCH(request) {
  try {
    const userId = await getAuthenticatedUser();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, completedMinutes, isCompleted } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const { databases } = createAdminClient();

    // Verify session belongs to user
    const session = await databases.getDocument(
      DATABASE_ID,
      SESSIONS_COLLECTION_ID,
      sessionId
    );

    if (session.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate minutes to add (difference from previous completedMinutes)
    const minutesToAdd = completedMinutes - session.completedMinutes;

    // Update session
    const updatedSession = await databases.updateDocument(
      DATABASE_ID,
      SESSIONS_COLLECTION_ID,
      sessionId,
      {
        completedMinutes: parseInt(completedMinutes),
        isCompleted:
          isCompleted !== undefined ? isCompleted : session.isCompleted,
      }
    );

    // Update total study minutes if there's an increase
    if (minutesToAdd > 0) {
      try {
        const profiles = await databases.listDocuments(
          DATABASE_ID,
          PROFILES_COLLECTION_ID,
          [Query.equal("userId", userId), Query.limit(1)]
        );

        if (profiles.documents.length > 0) {
          const profile = profiles.documents[0];
          const currentTotal = profile.totalStudyMinutes || 0;
          const newTotal = currentTotal + minutesToAdd;

          await databases.updateDocument(
            DATABASE_ID,
            PROFILES_COLLECTION_ID,
            profile.$id,
            {
              totalStudyMinutes: newTotal,
            }
          );
        }
      } catch (profileError) {
        console.error("Error updating profile study minutes:", profileError);
      }
    }

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating focus session:", error);
    return NextResponse.json(
      { error: "Failed to update focus session" },
      { status: 500 }
    );
  }
}
