# OAuth Setup Guide for Google and GitHub

This guide will help you configure Google and GitHub OAuth providers for your GenieLearn application.

## ✅ OAuth Implementation Complete!

**Current Status:** OAuth authentication is fully functional with Google and GitHub providers. The implementation uses `createOAuth2Token` for optimal browser compatibility and proper session handling.

## Prerequisites

1. Make sure your `.env.local` file contains:
   ```bash
   NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
   APPWRITE_API_KEY=your_api_key
   ```

**⚠️ OAuth will show "Provider not configured" errors until you complete the setup below.**

## Step 1: Configure Appwrite Console

### 1.1 Access Appwrite Console

1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Select your project
3. Navigate to **Auth** → **Settings**

### 1.2 Enable OAuth Providers

#### Google OAuth Setup:

1. In Appwrite Console, scroll to **OAuth2 Providers**
2. Find **Google** and click **Enable**
3. You'll need to configure Google OAuth credentials first (see Step 2)
4. Set the redirect URL to: `http://localhost:3000/api/auth/oauth/callback` (for development)
5. For production, use: `https://yourdomain.com/api/auth/oauth/callback`

#### GitHub OAuth Setup:

1. Find **GitHub** in the OAuth2 Providers section
2. Click **Enable**
3. You'll need GitHub OAuth credentials (see Step 3)
4. Use the same redirect URL as Google

## Step 2: Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it
4. Configure OAuth consent screen:
   - Go to **APIs & Services** → **OAuth consent screen**
   - Choose **External** (for testing) or **Internal** (for organization)
   - Fill in required fields:
     - App name: "GenieLearn"
     - User support email: your email
     - Developer contact: your email
5. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **+ Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: "GenieLearn OAuth"
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/oauth/callback` (development)
     - `https://yourdomain.com/api/auth/oauth/callback` (production)
6. Copy the **Client ID** and **Client Secret**

## Step 3: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the form:
   - **Application name**: GenieLearn
   - **Homepage URL**: `http://localhost:3000` (or your domain)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/oauth/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Generate a **Client Secret** and copy it

## Step 4: Configure Appwrite with OAuth Credentials

### For Google:

1. Return to Appwrite Console → **Auth** → **Settings**
2. Find **Google** in OAuth2 Providers
3. Enter your Google **Client ID** and **Client Secret**
4. Save the configuration

### For GitHub:

1. Find **GitHub** in OAuth2 Providers
2. Enter your GitHub **Client ID** and **Client Secret**
3. Save the configuration

## Step 5: Test OAuth Implementation

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`

3. You should see:

   - "Continue with Google" button
   - "Continue with GitHub" button
   - Existing email/password form

4. Test each OAuth provider:
   - Click the Google button → should redirect to Google login
   - Click the GitHub button → should redirect to GitHub login
   - After successful authentication, you should be redirected to `/dashboard`

## Troubleshooting

### Common Issues:

1. **"OAuth provider not enabled"**

   - Check that the provider is enabled in Appwrite Console
   - Verify Client ID and Secret are correctly entered

2. **"Redirect URI mismatch"**

   - Ensure the redirect URI in your OAuth app matches exactly:
   - `http://localhost:3000/api/auth/oauth/callback` (development)
   - `https://yourdomain.com/api/auth/oauth/callback` (production)

3. **"Invalid client"**

   - Double-check your Client ID and Client Secret
   - Make sure they're correctly entered in Appwrite Console

4. **CORS errors**
   - Verify your domain is added to Appwrite's platform settings
   - Check that NEXT_PUBLIC_APP_URL matches your actual URL

### Debug Tips:

1. Check browser console for errors
2. Check Appwrite Console → **Auth** → **Sessions** to see if sessions are being created
3. Verify network requests in DevTools to see OAuth flow

## Production Deployment

For production:

1. Update OAuth app redirect URIs to use your production domain
2. Update `NEXT_PUBLIC_APP_URL` in your environment variables
3. Make sure Appwrite project settings include your production domain
4. Test OAuth flows on production environment

## Security Notes

- Never commit OAuth credentials to version control
- Use environment variables for all sensitive data
- Regularly rotate OAuth secrets
- Monitor OAuth usage in provider dashboards
