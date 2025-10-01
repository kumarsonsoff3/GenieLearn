import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionClient, createAdminClient } from '@/src/lib/appwrite-server';
import { DATABASE_ID, COLLECTIONS } from '@/src/lib/appwrite-config';

export async function POST(request, { params }) {
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
    const { databases } = createSessionClient(session.value);
    const { users } = createAdminClient();

    // Get current user
    const account = await users.get(session.userId);

    // Get group
    const group = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      groupId
    );

    // Check if already a member
    if (group.members?.includes(account.$id)) {
      return NextResponse.json(
        { detail: 'Already a member of this group' },
        { status: 400 }
      );
    }

    // Add user to members array
    const updatedMembers = [...(group.members || []), account.$id];

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      groupId,
      {
        members: updatedMembers,
      }
    );

    return NextResponse.json({
      message: 'Successfully joined the group',
    });
  } catch (error) {
    console.error('Join group error:', error);
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
