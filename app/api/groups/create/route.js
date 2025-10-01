import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionClient, createAdminClient } from '@/src/lib/appwrite-server';
import { DATABASE_ID, COLLECTIONS } from '@/src/lib/appwrite-config';
import { ID, Query } from 'node-appwrite';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session) {
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { name, description, is_public } = await request.json();

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json(
        { detail: 'Group name is required' },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { detail: 'Group name must be less than 100 characters' },
        { status: 400 }
      );
    }

    if (description && description.length > 500) {
      return NextResponse.json(
        { detail: 'Description must be less than 500 characters' },
        { status: 400 }
      );
    }

    const { databases } = createSessionClient(session.value);
    const { users } = createAdminClient();

    // Get user info
    const account = await users.get(session.userId);

    // Get user profile for name
    let userName = account.name;
    try {
      const profile = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USER_PROFILES,
        account.$id
      );
      userName = profile.name;
    } catch (error) {
      console.log('Profile not found, using account name');
    }

    // Create group document
    const group = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      ID.unique(),
      {
        name: name.trim(),
        description: description ? description.trim() : '',
        is_public: is_public !== undefined ? is_public : true,
        creator_id: account.$id,
        members: [account.$id],
        created_at: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      id: group.$id,
      name: group.name,
      description: group.description,
      is_public: group.is_public,
      creator_id: group.creator_id,
      member_count: 1,
      is_member: true,
      created_at: group.created_at,
    });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { detail: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
