import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionClient, createAdminClient } from '@/src/lib/appwrite-server';
import { DATABASE_ID, COLLECTIONS } from '@/src/lib/appwrite-config';
import { Query } from 'node-appwrite';

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session');

    if (!session) {
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { groupId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const { databases } = createSessionClient(session.value);
    const { users } = createAdminClient();

    // Get current user
    const account = await users.get(session.userId);

    // Get group to check membership
    const group = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      groupId
    );

    // Check if user is a member
    if (!group.members?.includes(account.$id)) {
      return NextResponse.json(
        { detail: 'Not a member of this group' },
        { status: 403 }
      );
    }

    // Get messages for the group
    const { documents: messages } = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.MESSAGES,
      [
        Query.equal('group_id', groupId),
        Query.orderAsc('timestamp'),
        Query.limit(limit),
      ]
    );

    const messageResponses = messages.map(message => ({
      id: message.$id,
      content: message.content,
      group_id: message.group_id,
      sender_id: message.sender_id,
      sender_name: message.sender_name,
      timestamp: message.timestamp,
    }));

    return NextResponse.json(messageResponses);
  } catch (error) {
    console.error('Get messages error:', error);
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
