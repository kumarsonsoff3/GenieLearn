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

    // Check if user is a member
    if (!group.members?.includes(account.$id)) {
      return NextResponse.json(
        { detail: 'You are not a member of this group' },
        { status: 400 }
      );
    }

    // Prevent creator from leaving if there are other members
    if (group.creator_id === account.$id && group.members.length > 1) {
      return NextResponse.json(
        { detail: 'Group creator cannot leave while there are other members' },
        { status: 400 }
      );
    }

    // Remove user from members array
    const updatedMembers = group.members.filter(id => id !== account.$id);

    // Delete the group if no members are left
    if (updatedMembers.length === 0) {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        groupId
      );
      return NextResponse.json({
        message: 'Successfully left the group. Group was deleted as it had no remaining members.',
      });
    } else {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        groupId,
        {
          members: updatedMembers,
        }
      );
      return NextResponse.json({
        message: 'Successfully left the group',
      });
    }
  } catch (error) {
    console.error('Leave group error:', error);
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
