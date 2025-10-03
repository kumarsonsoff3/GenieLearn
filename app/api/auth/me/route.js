import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Account, Databases, Users } from "node-appwrite";

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
      // Fallback for old session format
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

    const users = new Users(adminClient);
    const databases = new Databases(adminClient);

    // Get user using admin client and userId from session
    let user;
    try {
      user = await users.get(sessionData.userId);
    } catch (error) {
      // User lookup failed - session may be invalid
      return NextResponse.json(
        { detail: "User not found or session invalid" },
        { status: 401 }
      );
    }

    // Get user profile from database
    try {
      const profile = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
        user.$id
      );

      return NextResponse.json({
        id: user.$id,
        name: profile.name,
        email: profile.email,
        subjects_of_interest: profile.subjects_of_interest || [],
      });
    } catch (error) {
      // If profile doesn't exist, return basic user info
      return NextResponse.json({
        id: user.$id,
        name: user.name,
        email: user.email,
        subjects_of_interest: [],
      });
    }
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
