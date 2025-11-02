import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Client, Databases, Users } from "node-appwrite";

export async function GET(request) {
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

    try {
      // Try to get profile by document ID first
      const profile = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
        userId
      );

      return NextResponse.json({
        id: profile.$id,
        userId: profile.user_id || profile.userId,
        name: profile.name,
        email: profile.email,
        subjects_of_interest: profile.subjects_of_interest || [],
        totalStudyMinutes: profile.totalStudyMinutes || 0,
      });
    } catch (error) {
      if (error.code === 404) {
        // Profile doesn't exist, return empty profile
        return NextResponse.json({
          id: null,
          userId: userId,
          name: "",
          email: "",
          subjects_of_interest: [],
          totalStudyMinutes: 0,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
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

    const { name, email, subjects_of_interest } = await request.json();

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ detail: "Name is required" }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { detail: "Email is required" },
        { status: 400 }
      );
    }

    // Create admin client for secure operations
    const adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(adminClient);
    const users = new Users(adminClient);

    // Get user ID from session
    const userId = sessionData.userId;

    // Try to get existing profile first to determine if we should update or create
    let profile;
    let isNewProfile = false;

    try {
      // Check if profile exists
      profile = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
        userId
      );
    } catch (error) {
      if (error.code === 404) {
        isNewProfile = true;
      } else {
        throw error;
      }
    }

    if (isNewProfile) {
      // Create new profile
      profile = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
        userId,
        {
          user_id: userId, // Use consistent attribute name
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subjects_of_interest: subjects_of_interest || [],
          created_at: new Date().toISOString(),
        }
      );

      return NextResponse.json({
        message: "Profile created successfully",
        profile: {
          id: profile.$id,
          name: profile.name,
          email: profile.email,
          subjects_of_interest: profile.subjects_of_interest,
        },
      });
    } else {
      // Update existing profile
      profile = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
        userId,
        {
          user_id: userId, // Include user_id as required by Appwrite schema
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subjects_of_interest: subjects_of_interest || [],
        }
      );

      // Also update the user account email if it changed
      const currentUser = await users.get(userId);
      if (currentUser.email !== email.trim().toLowerCase()) {
        try {
          await users.updateEmail(userId, email.trim().toLowerCase());
        } catch (error) {
          // Email update failed - continue with other updates
          // Continue even if email update fails
        }
      }

      return NextResponse.json({
        message: "Profile updated successfully",
        profile: {
          id: profile.$id,
          name: profile.name,
          email: profile.email,
          subjects_of_interest: profile.subjects_of_interest,
        },
      });
    }
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
