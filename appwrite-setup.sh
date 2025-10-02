#!/bin/bash

# Appwrite Setup Script for GenieLearn
# This script automates the Appwrite database setup using Appwrite CLI
# 
# Prerequisites:
# 1. Install Appwrite CLI: npm install -g appwrite-cli
# 2. Login to Appwrite: appwrite login
# 3. Set your project ID below or pass as argument

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${1:-}"
DATABASE_ID="genielearn"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  GenieLearn Appwrite Setup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if project ID is provided
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}Usage: $0 <project_id>${NC}"
    echo -e "${YELLOW}Example: $0 your-project-id-here${NC}"
    echo ""
    echo "You can find your project ID in Appwrite Console under Settings."
    exit 1
fi

echo -e "${GREEN}Using Project ID: ${PROJECT_ID}${NC}"
echo ""

# Check if appwrite CLI is installed
if ! command -v appwrite &> /dev/null; then
    echo -e "${RED}Error: Appwrite CLI is not installed${NC}"
    echo "Install it with: npm install -g appwrite-cli"
    exit 1
fi

echo -e "${BLUE}Step 1: Creating Database...${NC}"
appwrite databases create \
    --databaseId "$DATABASE_ID" \
    --name "GenieLearn Database" \
    --projectId "$PROJECT_ID" \
    2>/dev/null || echo -e "${YELLOW}Database might already exist, continuing...${NC}"

echo -e "${GREEN}✓ Database created/verified${NC}"
echo ""

# Collection 1: user_profiles
echo -e "${BLUE}Step 2: Creating 'user_profiles' collection...${NC}"
appwrite databases createCollection \
    --databaseId "$DATABASE_ID" \
    --collectionId "user_profiles" \
    --name "User Profiles" \
    --projectId "$PROJECT_ID" \
    --permissions 'read("users")' 'create("any")' 'update("users")' \
    2>/dev/null || echo -e "${YELLOW}Collection might already exist, continuing...${NC}"

echo -e "${BLUE}Creating attributes for user_profiles...${NC}"

# userId attribute
appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "user_profiles" \
    --key "userId" \
    --size 36 \
    --required true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# name attribute
appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "user_profiles" \
    --key "name" \
    --size 100 \
    --required true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# email attribute
appwrite databases createEmailAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "user_profiles" \
    --key "email" \
    --required true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# subjects_of_interest attribute (array)
appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "user_profiles" \
    --key "subjects_of_interest" \
    --size 50 \
    --required false \
    --array true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# created_at attribute
appwrite databases createDatetimeAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "user_profiles" \
    --key "created_at" \
    --required true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

echo -e "${BLUE}Creating indexes for user_profiles...${NC}"
sleep 2  # Wait for attributes to be created

# userId index
appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "user_profiles" \
    --key "userId_idx" \
    --type "key" \
    --attributes "userId" \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# email index (unique)
appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "user_profiles" \
    --key "email_idx" \
    --type "unique" \
    --attributes "email" \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

echo -e "${GREEN}✓ user_profiles collection created${NC}"
echo ""

# Collection 2: groups
echo -e "${BLUE}Step 3: Creating 'groups' collection...${NC}"
appwrite databases createCollection \
    --databaseId "$DATABASE_ID" \
    --collectionId "groups" \
    --name "Groups" \
    --projectId "$PROJECT_ID" \
    --permissions 'read("users")' 'create("any")' \
    2>/dev/null || echo -e "${YELLOW}Collection might already exist, continuing...${NC}"

echo -e "${BLUE}Creating attributes for groups...${NC}"

# name attribute
appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "groups" \
    --key "name" \
    --size 100 \
    --required true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# description attribute
appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "groups" \
    --key "description" \
    --size 500 \
    --required false \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# is_public attribute
appwrite databases createBooleanAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "groups" \
    --key "is_public" \
    --required true \
    --default true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# creator_id attribute
appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "groups" \
    --key "creator_id" \
    --size 36 \
    --required true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# members attribute (array)
appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "groups" \
    --key "members" \
    --size 36 \
    --required true \
    --array true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# created_at attribute
appwrite databases createDatetimeAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "groups" \
    --key "created_at" \
    --required true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

echo -e "${BLUE}Creating indexes for groups...${NC}"
sleep 2  # Wait for attributes to be created

# creator_id index
appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "groups" \
    --key "creator_idx" \
    --type "key" \
    --attributes "creator_id" \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# is_public index
appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "groups" \
    --key "public_idx" \
    --type "key" \
    --attributes "is_public" \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# created_at index
appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "groups" \
    --key "created_idx" \
    --type "key" \
    --attributes "created_at" \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

echo -e "${GREEN}✓ groups collection created${NC}"
echo ""

# Collection 3: messages
echo -e "${BLUE}Step 4: Creating 'messages' collection...${NC}"
appwrite databases createCollection \
    --databaseId "$DATABASE_ID" \
    --collectionId "messages" \
    --name "Messages" \
    --projectId "$PROJECT_ID" \
    --permissions 'read("users")' 'create("users")' \
    2>/dev/null || echo -e "${YELLOW}Collection might already exist, continuing...${NC}"

echo -e "${BLUE}Creating attributes for messages...${NC}"

# content attribute
appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "messages" \
    --key "content" \
    --size 1000 \
    --required true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# group_id attribute
appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "messages" \
    --key "group_id" \
    --size 36 \
    --required true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# sender_id attribute
appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "messages" \
    --key "sender_id" \
    --size 36 \
    --required true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# sender_name attribute
appwrite databases createStringAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "messages" \
    --key "sender_name" \
    --size 100 \
    --required true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# timestamp attribute
appwrite databases createDatetimeAttribute \
    --databaseId "$DATABASE_ID" \
    --collectionId "messages" \
    --key "timestamp" \
    --required true \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

echo -e "${BLUE}Creating indexes for messages...${NC}"
sleep 2  # Wait for attributes to be created

# group_id index
appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "messages" \
    --key "group_idx" \
    --type "key" \
    --attributes "group_id" \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# sender_id index
appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "messages" \
    --key "sender_idx" \
    --type "key" \
    --attributes "sender_id" \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

# timestamp index
appwrite databases createIndex \
    --databaseId "$DATABASE_ID" \
    --collectionId "messages" \
    --key "timestamp_idx" \
    --type "key" \
    --attributes "timestamp" \
    --projectId "$PROJECT_ID" \
    2>/dev/null || true

echo -e "${GREEN}✓ messages collection created${NC}"
echo ""

# Storage Bucket
echo -e "${BLUE}Step 5: Creating storage bucket...${NC}"
appwrite storage createBucket \
    --bucketId "files" \
    --name "GenieLearn Files" \
    --projectId "$PROJECT_ID" \
    --permissions 'read("users")' 'create("users")' 'update("users")' 'delete("users")' \
    2>/dev/null || echo -e "${YELLOW}Bucket might already exist, continuing...${NC}"

echo -e "${GREEN}✓ Storage bucket created${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Appwrite Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Go to Appwrite Console → Settings → API Keys"
echo "2. Create an API key with all necessary scopes"
echo "3. Update your .env.local file with:"
echo ""
echo -e "${BLUE}NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1${NC}"
echo -e "${BLUE}NEXT_PUBLIC_APPWRITE_PROJECT_ID=${PROJECT_ID}${NC}"
echo -e "${BLUE}APPWRITE_API_KEY=<your-api-key-here>${NC}"
echo -e "${BLUE}NEXT_PUBLIC_APPWRITE_DATABASE_ID=${DATABASE_ID}${NC}"
echo -e "${BLUE}NEXT_PUBLIC_APPWRITE_COLLECTION_GROUPS=groups${NC}"
echo -e "${BLUE}NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES=messages${NC}"
echo -e "${BLUE}NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES=user_profiles${NC}"
echo -e "${BLUE}NEXT_PUBLIC_APPWRITE_BUCKET_ID=files${NC}"
echo ""
echo -e "${GREEN}You can now run: npm run dev${NC}"
