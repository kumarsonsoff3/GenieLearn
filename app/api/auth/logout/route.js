import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Account, Client } from "node-appwrite";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (session) {
      // Delete current session
      try {
        const client = new Client()
          .setEndpoint(
            process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
              "https://cloud.appwrite.io/v1"
          )
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

        const account = new Account(client);
        await account.deleteSession("current");
      } catch (error) {
        // Session might already be invalid
        console.log("Session deletion error:", error);
      }

      // Clear session cookie
      cookieStore.delete("session");
    }

    return NextResponse.json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { detail: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
