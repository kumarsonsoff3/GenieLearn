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

    // Get all public groups
    const { documents: groups } = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      [
        Query.equal('is_public', true),
        Query.orderDesc('created_at'),
        Query.limit(100),
      ]
    );

    // Enrich groups with creator info and membership status
    const enrichedGroups = await Promise.all(
      groups.map(async (group) => {
        let creatorName = 'Unknown';
        try {
          const profile = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.USER_PROFILES,
            group.creator_id
          );
          creatorName = profile.name;
        } catch (error) {
          console.log('Creator profile not found');
        }

        return {
          id: group.$id,
          name: group.name,
          description: group.description,
          is_public: group.is_public,
          creator_id: group.creator_id,
          creator_name: creatorName,
          member_count: group.members?.length || 0,
          is_member: group.members?.includes(account.$id) || false,
          created_at: group.created_at,
        };
      })
    );

    return NextResponse.json(enrichedGroups);
  } catch (error) {
    console.error('List groups error:', error);
    return NextResponse.json(
      { detail: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
