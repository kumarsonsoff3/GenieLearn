// Appwrite client configuration for client-side operations
import { Client, Account, Databases, Storage } from "appwrite";

// Create client instance
const client = new Client();

client
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

// Create service instances
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Session management for client-side authentication
export const setupClientSession = async () => {
  try {
    // Check if we have a server-side session by calling our /api/auth/me endpoint
    const response = await fetch("/api/auth/me");

    if (response.ok) {
      const userData = await response.json();

      // Try to get the current session from Appwrite directly
      try {
        const currentUser = await account.get();
        return currentUser;
      } catch (appwriteError) {
        // For real-time, we'll use the anonymous client approach
        return {
          ...userData,
          isServerAuthenticated: true,
          hasAppwriteSession: false,
        };
      }
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

// Real-time compatible client (uses anonymous access with server validation)
export const createRealtimeClient = () => {
  const realtimeClient = new Client();

  realtimeClient
    .setEndpoint(
      process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
        "https://cloud.appwrite.io/v1"
    )
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

  return realtimeClient;
};

export { client };
