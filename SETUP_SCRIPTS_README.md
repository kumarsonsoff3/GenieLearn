# Appwrite Automated Setup Scripts

This directory contains automated setup scripts to quickly configure your Appwrite database for GenieLearn.

## Available Scripts

### 1. `appwrite-setup.sh` (Bash - Linux/Mac)
Bash script for Unix-based systems (Linux, macOS)

### 2. `appwrite-setup.js` (Node.js - Cross-platform)
Node.js script that works on all platforms (Windows, Linux, macOS)

## Prerequisites

Before running either script, you need:

1. **Appwrite CLI installed globally**
   ```bash
   npm install -g appwrite-cli
   ```

2. **Login to Appwrite**
   ```bash
   appwrite login
   ```
   This will open your browser to authenticate with Appwrite.

3. **Appwrite Project ID**
   - Go to [Appwrite Console](https://cloud.appwrite.io/)
   - Create a new project or use existing one
   - Copy the Project ID from Settings

## Usage

### Bash Script (Linux/Mac)

```bash
# Make script executable
chmod +x appwrite-setup.sh

# Run with your project ID
./appwrite-setup.sh your-project-id-here
```

### Node.js Script (All Platforms)

```bash
# Run with your project ID
node appwrite-setup.js your-project-id-here
```

### Windows (PowerShell)

```powershell
# Run Node.js version
node appwrite-setup.js your-project-id-here
```

## What Gets Created

The scripts will create:

### Database
- **ID**: `genielearn`
- **Name**: GenieLearn Database

### Collections

#### 1. user_profiles
Stores extended user profile information.

**Attributes:**
- `userId` (String, 36) - User ID reference
- `name` (String, 100) - User's full name
- `email` (Email) - User's email
- `subjects_of_interest` (String[], 50) - List of subjects
- `created_at` (DateTime) - Profile creation timestamp

**Indexes:**
- `userId_idx` - Key index on userId
- `email_idx` - Unique index on email

**Permissions:**
- Users can read all profiles
- Anyone can create profiles
- Users can update their own profiles

#### 2. groups
Stores study group information.

**Attributes:**
- `name` (String, 100) - Group name
- `description` (String, 500) - Group description
- `is_public` (Boolean, default: true) - Public/private flag
- `creator_id` (String, 36) - Creator user ID
- `members` (String[], 36) - Array of member IDs
- `created_at` (DateTime) - Group creation timestamp

**Indexes:**
- `creator_idx` - Key index on creator_id
- `public_idx` - Key index on is_public
- `created_idx` - Key index on created_at

**Permissions:**
- Users can read all groups
- Anyone can create groups

#### 3. messages
Stores chat messages within groups.

**Attributes:**
- `content` (String, 1000) - Message content
- `group_id` (String, 36) - Group ID reference
- `sender_id` (String, 36) - Sender user ID
- `sender_name` (String, 100) - Sender's name
- `timestamp` (DateTime) - Message timestamp

**Indexes:**
- `group_idx` - Key index on group_id
- `sender_idx` - Key index on sender_id
- `timestamp_idx` - Key index on timestamp

**Permissions:**
- Users can read all messages
- Users can create messages

### Storage Bucket

#### files
For file uploads and attachments.

**Permissions:**
- Users can read, create, update, and delete files

## After Running the Script

Once the script completes successfully:

### 1. Create API Key

1. Go to Appwrite Console → Settings → API Keys
2. Click "Create API Key"
3. Name: "GenieLearn Server"
4. Select all scopes for:
   - `users.*`
   - `databases.*`
   - `collections.*`
   - `documents.*`
   - `files.*`
5. Copy the API Key (you won't see it again!)

### 2. Update Environment Variables

Create/update `.env.local` in your project root:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here
APPWRITE_API_KEY=your-api-key-here

# Appwrite Database Configuration
NEXT_PUBLIC_APPWRITE_DATABASE_ID=genielearn
NEXT_PUBLIC_APPWRITE_COLLECTION_GROUPS=groups
NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES=messages
NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES=user_profiles
NEXT_PUBLIC_APPWRITE_BUCKET_ID=files
```

### 3. Start Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and test the registration/login!

## Troubleshooting

### "required option '--database-id <database-id>' not specified"
This error occurs if you're using an older or newer version of Appwrite CLI with different syntax.

**Solution**: Make sure you're using Appwrite CLI version 4.x or later. Update it:
```bash
npm uninstall -g appwrite-cli
npm install -g appwrite-cli
```

Then verify the version:
```bash
appwrite --version
```

The scripts use kebab-case parameters (`--database-id`, `--project-id`, etc.) which are required in newer versions.

### "appwrite command not found"
Install Appwrite CLI:
```bash
npm install -g appwrite-cli
```

### "Not authenticated" or "Session invalid"
Login to Appwrite:
```bash
appwrite login
```

This will open your browser. After authentication, a session file is created in `~/.appwrite/` directory.

### "Project not found"
Make sure you're using the correct Project ID from Appwrite Console → Settings.

Example: `6789abcd1234efgh5678`

### "Collection already exists"
The script handles this gracefully. Existing collections won't be modified. You'll see a warning message but the script continues.

### "Permission denied" on bash script
Make the script executable:
```bash
chmod +x appwrite-setup.sh
```

### Script runs but nothing created
- Check if you're logged into the correct Appwrite account
- Verify the Project ID is correct
- Check Appwrite Console to see if resources were created
- Check the script output for any error messages

### Windows-specific issues
On Windows, use the Node.js version which is more reliable:
```bash
node appwrite-setup.js your-project-id
```

PowerShell may have issues with the bash script.

## Manual Verification

After running the script, verify in Appwrite Console:

1. **Databases** → Check "genielearn" database exists
2. **Collections** → Verify 3 collections (user_profiles, groups, messages)
3. **Each Collection** → Check attributes and indexes are created
4. **Storage** → Verify "files" bucket exists

## Notes

- The scripts are idempotent - safe to run multiple times
- Existing resources won't be deleted or modified
- Errors for existing resources are suppressed
- Some operations may take a few seconds (indexes, attributes)

## Need Help?

- See [APPWRITE_SETUP.md](./APPWRITE_SETUP.md) for manual setup instructions
- Check [Appwrite Documentation](https://appwrite.io/docs)
- Review API logs in Appwrite Console → Logs

## Contributing

If you find issues or have improvements for these scripts:
1. Report issues in the repository
2. Submit pull requests with improvements
3. Add error handling for edge cases

---

**Happy coding! 🚀**
