import { NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";

// Handle both GET and POST requests
async function handleOAuthCallback(request) {
  try {
    // Get URL parameters from query string
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");
    let secret = searchParams.get("secret");

    // If not in query params, check if it's a POST request with body
    if ((!userId || !secret) && request.method === "POST") {
      try {
        const body = await request.json();
        userId = userId || body.userId;
        secret = secret || body.secret;
      } catch (e) {
        // Not JSON body, continue with query params
      }
    }

    // Check if we have the required OAuth parameters
    if (!userId || !secret) {
      return NextResponse.redirect(
        new URL("/login?error=missing_oauth_params", request.url)
      );
    }

    try {
      // Create Appwrite admin client for OAuth token session creation
      const adminClient = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

      const adminAccount = new Account(adminClient);

      // Exchange the OAuth token for a session using admin client
      const session = await adminAccount.createSession({ userId, secret });

      // Create a new client with the session to get user info
      const userClient = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
        .setSession(session.secret);

      const userAccount = new Account(userClient);
      const user = await userAccount.get();

      // Check if this is a new user by looking at registration date
      const isNewUser = new Date() - new Date(user.registration) < 60000; // Less than 1 minute ago

      // Store session in httpOnly cookie
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

      // Redirect based on user status
      if (isNewUser) {
        // New OAuth user - redirect to profile completion (optional)
        return NextResponse.redirect(
          new URL("/dashboard?welcome=true", request.url)
        );
      } else {
        // Existing user - go to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (appwriteError) {
      console.error("OAuth session creation failed:", appwriteError.message);
      return NextResponse.redirect(
        new URL("/login?error=oauth_session_failed", request.url)
      );
    }
  } catch (error) {
    console.error("OAuth callback error:", error.message);
    return NextResponse.redirect(
      new URL("/login?error=oauth_callback_error", request.url)
    );
  }
}

// Export both GET and POST handlers
export async function GET(request) {
  return handleOAuthCallback(request);
}

export async function POST(request) {
  return handleOAuthCallback(request);
}
