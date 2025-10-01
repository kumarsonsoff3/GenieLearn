import { NextResponse } from 'next/server';
import { createAdminClient } from '@/src/lib/appwrite-server';
import { ID } from 'node-appwrite';
import { DATABASE_ID, COLLECTIONS } from '@/src/lib/appwrite-config';

export async function POST(request) {
  try {
    const { name, email, password, subjects_of_interest } = await request.json();

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { detail: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { detail: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { detail: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const { users, databases } = createAdminClient();

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
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        user.$id,
        {
          userId: user.$id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          subjects_of_interest: subjects_of_interest || [],
          created_at: new Date().toISOString(),
        }
      );

      return NextResponse.json({
        message: 'User registered successfully',
        userId: user.$id,
      });
    } catch (error) {
      if (error.code === 409) {
        return NextResponse.json(
          { detail: 'Email already registered' },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { detail: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
