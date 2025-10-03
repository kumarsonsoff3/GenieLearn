import { NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";

export async function POST(request) {
  try {
    const { provider } = await request.json();

    // Validate provider
    const allowedProviders = ["google", "github"];
    if (!provider || !allowedProviders.includes(provider)) {
      return NextResponse.json(
        { error: "Invalid provider. Supported providers: google, github" },
        { status: 400 }
      );
    }

    // Create Appwrite client for token-based OAuth
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

    const account = new Account(client);

    // Define redirect URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const successUrl = `${baseUrl}/api/auth/oauth/callback`;
    const failureUrl = `${baseUrl}/login?error=oauth_failed`;

    try {
      // Use createOAuth2Token for better browser compatibility (avoids third-party cookie issues)
      const oauthUrl = await account.createOAuth2Token(
        provider,
        successUrl,
        failureUrl
      );

      return NextResponse.json({
        success: true,
        redirectUrl: oauthUrl,
      });
    } catch (tokenError) {
      // Fallback to direct URL generation if token method fails
      const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

      const oauthUrl =
        `${appwriteEndpoint}/account/sessions/oauth2/${provider}` +
        `?project=${projectId}` +
        `&success=${encodeURIComponent(successUrl)}` +
        `&failure=${encodeURIComponent(failureUrl)}`;

      return NextResponse.json({
        success: true,
        redirectUrl: oauthUrl,
      });
    }
  } catch (error) {
    console.error("OAuth initiation error:", error);
    return NextResponse.json(
      { error: "Internal server error during OAuth initiation" },
      { status: 500 }
    );
  }
}
