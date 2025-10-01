import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { account } from '@/src/lib/appwrite';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (session) {
      // Delete current session
      try {
        await account.deleteSession('current');
      } catch (error) {
        // Session might already be invalid
        console.log('Session deletion error:', error);
      }

      // Clear session cookie
      cookieStore.delete('session');
    }

    return NextResponse.json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { detail: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
