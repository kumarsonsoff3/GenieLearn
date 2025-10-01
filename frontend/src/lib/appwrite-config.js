// Appwrite Database and Collection IDs
// These should match your Appwrite project setup

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'genielearn';

export const COLLECTIONS = {
  GROUPS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GROUPS || 'groups',
  MESSAGES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES || 'messages',
  USER_PROFILES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES || 'user_profiles',
};

export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'files';
