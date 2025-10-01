import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionClient, createAdminClient } from '@/src/lib/appwrite-server';
import { DATABASE_ID, COLLECTIONS } from '@/src/lib/appwrite-config';
import { Query } from 'node-appwrite';

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

    // Get current user
    const account = await users.get(session.userId);

    // Get all groups
    const { documents: allGroups } = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      [Query.limit(1000)]
    );

    // Calculate statistics
    const totalGroups = allGroups.length;
    const publicGroups = allGroups.filter(g => g.is_public);
    const totalPublicGroups = publicGroups.length;
    
    const userGroups = allGroups.filter(g => g.members?.includes(account.$id));
    const userJoinedGroups = userGroups.length;
    
    const publicGroupsJoined = userGroups.filter(g => g.is_public).length;
    const publicGroupsNotJoined = totalPublicGroups - publicGroupsJoined;

    return NextResponse.json({
      totalGroups,
      totalPublicGroups,
      userJoinedGroups,
      publicGroupsJoined,
      publicGroupsNotJoined,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { detail: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
