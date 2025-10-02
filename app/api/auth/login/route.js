import { NextResponse } from "next/server";
import { Account, Client, Users } from "node-appwrite";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !email.trim()) {
      return NextResponse.json(
        { detail: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { detail: "Password is required" },
        { status: 400 }
      );
    }

    // Create session with Appwrite
    try {
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

      const account = new Account(client);
      const session = await account.createEmailPasswordSession(
        email.trim().toLowerCase(),
        password
      );

      // Set session cookie with full session data
      const cookieStore = await cookies();
      const sessionData = {
        secret: session.secret,
        userId: session.userId,
        expire: session.expire,
      };

      cookieStore.set("session", JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return NextResponse.json({
        message: "Login successful",
        userId: session.userId,
      });
    } catch (error) {
      if (error.code === 401) {
        return NextResponse.json(
          { detail: "Incorrect email or password" },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
