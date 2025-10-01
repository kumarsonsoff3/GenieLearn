// Appwrite server configuration for API routes
import { Client, Users, Databases, Storage } from 'node-appwrite';

export const createAdminClient = () => {
  const client = new Client();
  
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

  return {
    client,
    users: new Users(client),
    databases: new Databases(client),
    storage: new Storage(client),
  };
};

export const createSessionClient = (session) => {
  const client = new Client();
  
  client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

  if (session) {
    client.setSession(session);
  }

  return {
    client,
    databases: new Databases(client),
    storage: new Storage(client),
  };
};
