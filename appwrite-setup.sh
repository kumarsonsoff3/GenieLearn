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

# Set project context
echo -e "${BLUE}Setting project context...${NC}"
appwrite client set-project "$PROJECT_ID" || {
    echo -e "${RED}Failed to set project context. Make sure you are logged in with: appwrite login${NC}"
    exit 1
}
echo -e "${GREEN}✓ Project context set${NC}"
echo ""

echo -e "${BLUE}Step 1: Creating Database...${NC}"
appwrite databases create \
    --database-id "$DATABASE_ID" \
    --name "GenieLearn Database" \
    2>/dev/null || echo -e "${YELLOW}Database might already exist, continuing...${NC}"

echo -e "${GREEN}✓ Database created/verified${NC}"
echo ""

# Collection 1: user_profiles
echo -e "${BLUE}Step 2: Creating 'user_profiles' collection...${NC}"
appwrite databases create-collection \
    --database-id "$DATABASE_ID" \
    --collection-id "user_profiles" \
    --name "User Profiles" \
    --permissions 'read("any")' 'create("users")' 'update("users")' \
    2>/dev/null || echo -e "${YELLOW}Collection might already exist, continuing...${NC}"

echo -e "${BLUE}Creating attributes for user_profiles...${NC}"

# userId attribute
appwrite databases create-string-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "user_profiles" \
    --key "userId" \
    --size 36 \
    --required true \
    2>/dev/null || true

# name attribute
appwrite databases create-string-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "user_profiles" \
    --key "name" \
    --size 100 \
    --required true \
    2>/dev/null || true

# email attribute
appwrite databases create-email-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "user_profiles" \
    --key "email" \
    --required true \
    2>/dev/null || true

# subjects_of_interest attribute (array)
appwrite databases create-string-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "user_profiles" \
    --key "subjects_of_interest" \
    --size 50 \
    --required false \
    --array true \
    2>/dev/null || true

# created_at attribute
appwrite databases create-datetime-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "user_profiles" \
    --key "created_at" \
    --required true \
    2>/dev/null || true

echo -e "${BLUE}Creating indexes for user_profiles...${NC}"
sleep 2  # Wait for attributes to be created

# userId index
appwrite databases create-index \
    --database-id "$DATABASE_ID" \
    --collection-id "user_profiles" \
    --key "userId_idx" \
    --type "key" \
    --attributes "userId" \
    2>/dev/null || true

# email index (unique)
appwrite databases create-index \
    --database-id "$DATABASE_ID" \
    --collection-id "user_profiles" \
    --key "email_idx" \
    --type "unique" \
    --attributes "email" \
    2>/dev/null || true

echo -e "${GREEN}✓ user_profiles collection created${NC}"
echo ""

# Collection 2: groups
echo -e "${BLUE}Step 3: Creating 'groups' collection...${NC}"
appwrite databases create-collection \
    --database-id "$DATABASE_ID" \
    --collection-id "groups" \
    --name "Groups" \
    --permissions 'read("any")' 'create("users")' \
    2>/dev/null || echo -e "${YELLOW}Collection might already exist, continuing...${NC}"

echo -e "${BLUE}Creating attributes for groups...${NC}"

# name attribute
appwrite databases create-string-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "groups" \
    --key "name" \
    --size 100 \
    --required true \
    2>/dev/null || true

# description attribute
appwrite databases create-string-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "groups" \
    --key "description" \
    --size 500 \
    --required false \
    2>/dev/null || true

# is_public attribute
appwrite databases create-boolean-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "groups" \
    --key "is_public" \
    --required true \
    --default true \
    2>/dev/null || true

# creator_id attribute
appwrite databases create-string-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "groups" \
    --key "creator_id" \
    --size 36 \
    --required true \
    2>/dev/null || true

# members attribute (array)
appwrite databases create-string-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "groups" \
    --key "members" \
    --size 36 \
    --required true \
    --array true \
    2>/dev/null || true

# created_at attribute
appwrite databases create-datetime-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "groups" \
    --key "created_at" \
    --required true \
    2>/dev/null || true

echo -e "${BLUE}Creating indexes for groups...${NC}"
sleep 2  # Wait for attributes to be created

# creator_id index
appwrite databases create-index \
    --database-id "$DATABASE_ID" \
    --collection-id "groups" \
    --key "creator_idx" \
    --type "key" \
    --attributes "creator_id" \
    2>/dev/null || true

# is_public index
appwrite databases create-index \
    --database-id "$DATABASE_ID" \
    --collection-id "groups" \
    --key "public_idx" \
    --type "key" \
    --attributes "is_public" \
    2>/dev/null || true

# created_at index
appwrite databases create-index \
    --database-id "$DATABASE_ID" \
    --collection-id "groups" \
    --key "created_idx" \
    --type "key" \
    --attributes "created_at" \
    2>/dev/null || true

echo -e "${GREEN}✓ groups collection created${NC}"
echo ""

# Collection 3: messages
echo -e "${BLUE}Step 4: Creating 'messages' collection...${NC}"
appwrite databases create-collection \
    --database-id "$DATABASE_ID" \
    --collection-id "messages" \
    --name "Messages" \
    --permissions 'read("any")' 'create("users")' \
    2>/dev/null || echo -e "${YELLOW}Collection might already exist, continuing...${NC}"

echo -e "${BLUE}Creating attributes for messages...${NC}"

# content attribute
appwrite databases create-string-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "messages" \
    --key "content" \
    --size 1000 \
    --required true \
    2>/dev/null || true

# group_id attribute
appwrite databases create-string-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "messages" \
    --key "group_id" \
    --size 36 \
    --required true \
    2>/dev/null || true

# sender_id attribute
appwrite databases create-string-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "messages" \
    --key "sender_id" \
    --size 36 \
    --required true \
    2>/dev/null || true

# sender_name attribute
appwrite databases create-string-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "messages" \
    --key "sender_name" \
    --size 100 \
    --required true \
    2>/dev/null || true

# timestamp attribute
appwrite databases create-datetime-attribute \
    --database-id "$DATABASE_ID" \
    --collection-id "messages" \
    --key "timestamp" \
    --required true \
    2>/dev/null || true

echo -e "${BLUE}Creating indexes for messages...${NC}"
sleep 2  # Wait for attributes to be created

# group_id index
appwrite databases create-index \
    --database-id "$DATABASE_ID" \
    --collection-id "messages" \
    --key "group_idx" \
    --type "key" \
    --attributes "group_id" \
    2>/dev/null || true

# sender_id index
appwrite databases create-index \
    --database-id "$DATABASE_ID" \
    --collection-id "messages" \
    --key "sender_idx" \
    --type "key" \
    --attributes "sender_id" \
    2>/dev/null || true

# timestamp index
appwrite databases create-index \
    --database-id "$DATABASE_ID" \
    --collection-id "messages" \
    --key "timestamp_idx" \
    --type "key" \
    --attributes "timestamp" \
    2>/dev/null || true

echo -e "${GREEN}✓ messages collection created${NC}"
echo ""

# Storage Bucket
echo -e "${BLUE}Step 5: Creating storage bucket...${NC}"
appwrite storage create-bucket \
    --bucket-id "files" \
    --name "GenieLearn Files" \
    --permissions 'read("any")' 'create("users")' 'update("users")' 'delete("users")' \
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
