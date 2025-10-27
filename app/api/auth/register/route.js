import { NextResponse } from "next/server";
import { Client, Users, Databases, ID } from "node-appwrite";

export async function POST(request) {
  try {
    const { name, email, password, subjects_of_interest } =
      await request.json();

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ detail: "Name is required" }, { status: 400 });
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { detail: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { detail: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Create admin client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const users = new Users(client);
    const databases = new Databases(client);

    // Create user account in Appwrite
    try {
      const user = await users.create(
        ID.unique(),
        email.trim().toLowerCase(),
        undefined, // phone (optional)
        password,
        name.trim()
      );

      // Create user profile document in database
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID,
        user.$id,
        {
          user_id: user.$id, // Use consistent attribute name
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subjects_of_interest: subjects_of_interest || [],
          created_at: new Date().toISOString(),
        }
      );

      return NextResponse.json({
        message: "User registered successfully",
        userId: user.$id,
      });
    } catch (error) {
      if (error.code === 409) {
        return NextResponse.json(
          { detail: "Email already registered" },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
