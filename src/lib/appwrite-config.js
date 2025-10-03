// Appwrite Database and Collection IDs
// These should match your Appwrite project setup

export const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "genielearn";

export const COLLECTIONS = {
  GROUPS: process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID || "groups",
  MESSAGES:
    process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID || "messages",
  USER_PROFILES:
    process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID ||
    "user_profiles",
};

export const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || "files";
