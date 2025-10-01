import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionClient, createAdminClient } from '@/src/lib/appwrite-server';
import { DATABASE_ID, COLLECTIONS } from '@/src/lib/appwrite-config';
import { ID } from 'node-appwrite';

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

    const { content, group_id } = await request.json();

    // Validation
    if (!content || !content.trim()) {
      return NextResponse.json(
        { detail: 'Message content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { detail: 'Message must be less than 1000 characters' },
        { status: 400 }
      );
    }

    if (!group_id) {
      return NextResponse.json(
        { detail: 'Group ID is required' },
        { status: 400 }
      );
    }

    const { databases } = createSessionClient(session.value);
    const { users } = createAdminClient();

    // Get current user
    const account = await users.get(session.userId);

    // Get user name
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

    // Check if user is a member of the group
    const group = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      group_id
    );

    if (!group.members?.includes(account.$id)) {
      return NextResponse.json(
        { detail: 'Not a member of this group' },
        { status: 403 }
      );
    }

    // Create message
    const message = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      ID.unique(),
      {
        content: content.trim(),
        group_id,
        sender_id: account.$id,
        sender_name: userName,
        timestamp: new Date().toISOString(),
      }
    );

    return NextResponse.json({
      id: message.$id,
      content: message.content,
      group_id: message.group_id,
      sender_id: message.sender_id,
      sender_name: message.sender_name,
      timestamp: message.timestamp,
    });
  } catch (error) {
    console.error('Create message error:', error);
    if (error.code === 404) {
      return NextResponse.json(
        { detail: 'Group not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { detail: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
