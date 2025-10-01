import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionClient, createAdminClient } from '@/src/lib/appwrite-server';
import { DATABASE_ID, COLLECTIONS } from '@/src/lib/appwrite-config';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session) {
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { databases } = createSessionClient(session.value);
    const { users } = createAdminClient();

    // Get current user from session
    const account = await users.get(session.userId);
    
    // Get user profile from database
    try {
      const profile = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        account.$id
      );

      return NextResponse.json({
        id: account.$id,
        name: profile.name,
        email: profile.email,
        subjects_of_interest: profile.subjects_of_interest || [],
      });
    } catch (error) {
      // If profile doesn't exist, return basic user info
      return NextResponse.json({
        id: account.$id,
        name: account.name,
        email: account.email,
        subjects_of_interest: [],
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { detail: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
