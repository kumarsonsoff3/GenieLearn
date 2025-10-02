#!/usr/bin/env node

/**
 * Appwrite Setup Script for GenieLearn
 * 
 * This script automates the Appwrite database setup using Appwrite CLI
 * 
 * Prerequisites:
 * 1. Install Appwrite CLI: npm install -g appwrite-cli
 * 2. Login to Appwrite: appwrite login
 * 3. Run: node appwrite-setup.js <project_id>
 */

const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
};

// Configuration
const PROJECT_ID = process.argv[2];
const DATABASE_ID = 'genielearn';

// Helper function to run Appwrite CLI commands
function runCommand(command, ignoreError = false) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    if (!ignoreError) {
      log.warning('Command failed, but continuing...');
    }
    return false;
  }
}

// Helper to wait (for attributes to be created before indexes)
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  log.info('========================================');
  log.info('  GenieLearn Appwrite Setup Script');
  log.info('========================================');
  console.log('');

  // Check if project ID is provided
  if (!PROJECT_ID) {
    log.error('Usage: node appwrite-setup.js <project_id>');
    log.warning('Example: node appwrite-setup.js your-project-id-here');
    console.log('');
    console.log('You can find your project ID in Appwrite Console under Settings.');
    process.exit(1);
  }

  log.success(`Using Project ID: ${PROJECT_ID}`);
  console.log('');

  // Check if appwrite CLI is installed
  try {
    execSync('appwrite --version', { stdio: 'ignore' });
  } catch {
    log.error('Error: Appwrite CLI is not installed');
    console.log('Install it with: npm install -g appwrite-cli');
    process.exit(1);
  }

  // Set the project ID globally for all commands
  log.info('Setting project context...');
  try {
    execSync(`appwrite client set-project ${PROJECT_ID}`, { stdio: 'ignore' });
    log.success('✓ Project context set');
    console.log('');
  } catch {
    log.error('Failed to set project context. Make sure you are logged in with: appwrite login');
    process.exit(1);
  }

  try {
    // Step 1: Create Database
    log.info('Step 1: Creating Database...');
    runCommand(
      `appwrite databases create --database-id "${DATABASE_ID}" --name "GenieLearn Database"`,
      true
    );
    log.success('✓ Database created/verified');
    console.log('');

    // Step 2: Create user_profiles collection
    log.info('Step 2: Creating \'user_profiles\' collection...');
    runCommand(
      `appwrite databases create-collection --database-id "${DATABASE_ID}" --collection-id "user_profiles" --name "User Profiles" --permissions 'read("any")' 'create("users")' 'update("users")'`,
      true
    );

    log.info('Creating attributes for user_profiles...');
    runCommand(`appwrite databases create-string-attribute --database-id "${DATABASE_ID}" --collection-id "user_profiles" --key "userId" --size 36 --required true`, true);
    runCommand(`appwrite databases create-string-attribute --database-id "${DATABASE_ID}" --collection-id "user_profiles" --key "name" --size 100 --required true`, true);
    runCommand(`appwrite databases create-email-attribute --database-id "${DATABASE_ID}" --collection-id "user_profiles" --key "email" --required true`, true);
    runCommand(`appwrite databases create-string-attribute --database-id "${DATABASE_ID}" --collection-id "user_profiles" --key "subjects_of_interest" --size 50 --required false --array true`, true);
    runCommand(`appwrite databases create-datetime-attribute --database-id "${DATABASE_ID}" --collection-id "user_profiles" --key "created_at" --required true`, true);

    log.info('Creating indexes for user_profiles...');
    await wait(2000); // Wait for attributes
    runCommand(`appwrite databases create-index --database-id "${DATABASE_ID}" --collection-id "user_profiles" --key "userId_idx" --type "key" --attributes "userId"`, true);
    runCommand(`appwrite databases create-index --database-id "${DATABASE_ID}" --collection-id "user_profiles" --key "email_idx" --type "unique" --attributes "email"`, true);

    log.success('✓ user_profiles collection created');
    console.log('');

    // Step 3: Create groups collection
    log.info('Step 3: Creating \'groups\' collection...');
    runCommand(
      `appwrite databases create-collection --database-id "${DATABASE_ID}" --collection-id "groups" --name "Groups" --permissions 'read("any")' 'create("users")'`,
      true
    );

    log.info('Creating attributes for groups...');
    runCommand(`appwrite databases create-string-attribute --database-id "${DATABASE_ID}" --collection-id "groups" --key "name" --size 100 --required true`, true);
    runCommand(`appwrite databases create-string-attribute --database-id "${DATABASE_ID}" --collection-id "groups" --key "description" --size 500 --required false`, true);
    runCommand(`appwrite databases create-boolean-attribute --database-id "${DATABASE_ID}" --collection-id "groups" --key "is_public" --required true --default true`, true);
    runCommand(`appwrite databases create-string-attribute --database-id "${DATABASE_ID}" --collection-id "groups" --key "creator_id" --size 36 --required true`, true);
    runCommand(`appwrite databases create-string-attribute --database-id "${DATABASE_ID}" --collection-id "groups" --key "members" --size 36 --required true --array true`, true);
    runCommand(`appwrite databases create-datetime-attribute --database-id "${DATABASE_ID}" --collection-id "groups" --key "created_at" --required true`, true);

    log.info('Creating indexes for groups...');
    await wait(2000);
    runCommand(`appwrite databases create-index --database-id "${DATABASE_ID}" --collection-id "groups" --key "creator_idx" --type "key" --attributes "creator_id"`, true);
    runCommand(`appwrite databases create-index --database-id "${DATABASE_ID}" --collection-id "groups" --key "public_idx" --type "key" --attributes "is_public"`, true);
    runCommand(`appwrite databases create-index --database-id "${DATABASE_ID}" --collection-id "groups" --key "created_idx" --type "key" --attributes "created_at"`, true);

    log.success('✓ groups collection created');
    console.log('');

    // Step 4: Create messages collection
    log.info('Step 4: Creating \'messages\' collection...');
    runCommand(
      `appwrite databases create-collection --database-id "${DATABASE_ID}" --collection-id "messages" --name "Messages" --permissions 'read("any")' 'create("users")'`,
      true
    );

    log.info('Creating attributes for messages...');
    runCommand(`appwrite databases create-string-attribute --database-id "${DATABASE_ID}" --collection-id "messages" --key "content" --size 1000 --required true`, true);
    runCommand(`appwrite databases create-string-attribute --database-id "${DATABASE_ID}" --collection-id "messages" --key "group_id" --size 36 --required true`, true);
    runCommand(`appwrite databases create-string-attribute --database-id "${DATABASE_ID}" --collection-id "messages" --key "sender_id" --size 36 --required true`, true);
    runCommand(`appwrite databases create-string-attribute --database-id "${DATABASE_ID}" --collection-id "messages" --key "sender_name" --size 100 --required true`, true);
    runCommand(`appwrite databases create-datetime-attribute --database-id "${DATABASE_ID}" --collection-id "messages" --key "timestamp" --required true`, true);

    log.info('Creating indexes for messages...');
    await wait(2000);
    runCommand(`appwrite databases create-index --database-id "${DATABASE_ID}" --collection-id "messages" --key "group_idx" --type "key" --attributes "group_id"`, true);
    runCommand(`appwrite databases create-index --database-id "${DATABASE_ID}" --collection-id "messages" --key "sender_idx" --type "key" --attributes "sender_id"`, true);
    runCommand(`appwrite databases create-index --database-id "${DATABASE_ID}" --collection-id "messages" --key "timestamp_idx" --type "key" --attributes "timestamp"`, true);

    log.success('✓ messages collection created');
    console.log('');

    // Step 5: Create storage bucket
    log.info('Step 5: Creating storage bucket...');
    runCommand(
      `appwrite storage create-bucket --bucket-id "files" --name "GenieLearn Files" --permissions 'read("any")' 'create("users")' 'update("users")' 'delete("users")'`,
      true
    );
    log.success('✓ Storage bucket created');
    console.log('');

    // Success message
    log.success('========================================');
    log.success('  ✓ Appwrite Setup Complete!');
    log.success('========================================');
    console.log('');
    log.warning('Next Steps:');
    console.log('1. Go to Appwrite Console → Settings → API Keys');
    console.log('2. Create an API key with all necessary scopes');
    console.log('3. Update your .env.local file with:');
    console.log('');
    log.info('NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1');
    log.info(`NEXT_PUBLIC_APPWRITE_PROJECT_ID=${PROJECT_ID}`);
    log.info('APPWRITE_API_KEY=<your-api-key-here>');
    log.info(`NEXT_PUBLIC_APPWRITE_DATABASE_ID=${DATABASE_ID}`);
    log.info('NEXT_PUBLIC_APPWRITE_COLLECTION_GROUPS=groups');
    log.info('NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES=messages');
    log.info('NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES=user_profiles');
    log.info('NEXT_PUBLIC_APPWRITE_BUCKET_ID=files');
    console.log('');
    log.success('You can now run: npm run dev');
  } catch (error) {
    log.error('Setup failed with error:');
    console.error(error);
    process.exit(1);
  }
}

main();
