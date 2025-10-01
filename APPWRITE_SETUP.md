# Appwrite Setup Guide for GenieLearn

This guide will help you set up Appwrite for the GenieLearn application.

## Prerequisites

- An Appwrite Cloud account or self-hosted Appwrite instance
- Appwrite Console access

## Setup Steps

### 1. Create a New Project

1. Go to [Appwrite Cloud Console](https://cloud.appwrite.io/) or your self-hosted instance
2. Click "Create Project"
3. Name it "GenieLearn" or your preferred name
4. Copy the **Project ID**

### 2. Create API Key

1. Go to "Settings" → "API Keys"
2. Click "Create API Key"
3. Name: "GenieLearn Server"
4. Scopes: Select all scopes for:
   - `users.*`
   - `databases.*`
   - `collections.*`
   - `documents.*`
   - `files.*`
5. Copy the **API Key** (you won't see it again!)

### 3. Create Database

1. Go to "Databases"
2. Click "Create Database"
3. Database ID: `genielearn`
4. Name: "GenieLearn Database"

### 4. Create Collections

#### Collection 1: user_profiles
- Collection ID: `user_profiles`
- Permissions: 
  - Role: Users - Read, Update (own documents)
  - Role: Any - Create

**Attributes:**
- `userId` - String (36) - Required
- `name` - String (100) - Required
- `email` - Email - Required
- `subjects_of_interest` - String[] - Optional
- `created_at` - DateTime - Required

**Indexes:**
- Key: `userId_idx`, Type: Key, Attributes: `userId`
- Key: `email_idx`, Type: Unique, Attributes: `email`

#### Collection 2: groups
- Collection ID: `groups`
- Permissions:
  - Role: Users - Read
  - Role: Any - Create

**Attributes:**
- `name` - String (100) - Required
- `description` - String (500) - Optional
- `is_public` - Boolean - Required - Default: true
- `creator_id` - String (36) - Required
- `members` - String[] - Required
- `created_at` - DateTime - Required

**Indexes:**
- Key: `creator_idx`, Type: Key, Attributes: `creator_id`
- Key: `public_idx`, Type: Key, Attributes: `is_public`
- Key: `created_idx`, Type: Key, Attributes: `created_at`

#### Collection 3: messages
- Collection ID: `messages`
- Permissions:
  - Role: Users - Read, Create

**Attributes:**
- `content` - String (1000) - Required
- `group_id` - String (36) - Required
- `sender_id` - String (36) - Required
- `sender_name` - String (100) - Required
- `timestamp` - DateTime - Required

**Indexes:**
- Key: `group_idx`, Type: Key, Attributes: `group_id`
- Key: `sender_idx`, Type: Key, Attributes: `sender_id`
- Key: `timestamp_idx`, Type: Key, Attributes: `timestamp`

### 5. Create Storage Bucket (Optional)

1. Go to "Storage"
2. Click "Create Bucket"
3. Bucket ID: `files`
4. Name: "GenieLearn Files"
5. Permissions:
   - Role: Users - Read, Create, Update, Delete

### 6. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here

# Appwrite Database Configuration
NEXT_PUBLIC_APPWRITE_DATABASE_ID=genielearn
NEXT_PUBLIC_APPWRITE_COLLECTION_GROUPS=groups
NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES=messages
NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES=user_profiles
NEXT_PUBLIC_APPWRITE_BUCKET_ID=files
```

### 7. Test the Setup

1. Start the development server: `npm run dev`
2. Try registering a new user
3. Check if the user appears in Appwrite Console under "Auth" → "Users"
4. Check if user profile is created in "Databases" → "user_profiles"

## Realtime Setup

Appwrite Realtime is automatically configured. To listen to real-time events:

```javascript
import { client } from '@/src/lib/appwrite';

// Subscribe to messages in a group
client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`, response => {
  console.log('New message:', response.payload);
});
```

## Security Notes

1. **Never commit `.env.local`** - It contains sensitive API keys
2. **API Key Scopes** - Use minimum required scopes in production
3. **Collection Permissions** - Review and adjust based on your security requirements
4. **Rate Limiting** - Configure in Appwrite Console under "Settings" → "Security"

## Troubleshooting

### "Project not found" error
- Check if `NEXT_PUBLIC_APPWRITE_PROJECT_ID` is correct
- Verify the endpoint URL matches your Appwrite instance

### "Invalid API Key" error
- Regenerate API key with correct scopes
- Ensure `APPWRITE_API_KEY` is set correctly

### "Collection not found" error
- Verify collection IDs match exactly
- Check if database ID is correct

### "Permission denied" errors
- Review collection permissions in Appwrite Console
- Ensure user is authenticated for protected operations

## Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite SDKs](https://appwrite.io/docs/sdks)
- [Appwrite Realtime](https://appwrite.io/docs/realtime)
- [Next.js with Appwrite](https://appwrite.io/docs/quick-starts/nextjs)
