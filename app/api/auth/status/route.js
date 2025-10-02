import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Simple endpoint to check if user has a valid session
 * Returns just a boolean - doesn't expose sensitive data
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    // Simply return whether a session exists
    return NextResponse.json({
      hasSession: !!session?.value,
    });
  } catch (error) {
    console.error("Auth status check error:", error);
    return NextResponse.json({
      hasSession: false,
    });
  }
}
