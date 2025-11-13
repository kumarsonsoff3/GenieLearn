import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized - No session found" },
        { status: 401 }
      );
    }

    // Parse session data to get user ID
    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (error) {
      console.error("Session parse error:", error);
      return NextResponse.json(
        { error: "Invalid session format" },
        { status: 401 }
      );
    }

    const userId = sessionData.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid session - user ID not found" },
        { status: 401 }
      );
    }

    // Create admin client
    const { Client, Databases } = await import("node-appwrite");
    const { Query } = await import("node-appwrite");

    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get("source_type");
    const limit = parseInt(searchParams.get("limit")) || 100;
    const offset = parseInt(searchParams.get("offset")) || 0;

    // Build query
    const queries = [
      Query.equal("user_id", userId),
      Query.orderDesc("created_at"),
      Query.limit(limit),
      Query.offset(offset),
    ];

    if (sourceType && sourceType !== "all") {
      queries.push(Query.equal("source_type", sourceType));
    }

    // Fetch notes
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_PERSONAL_NOTES_COLLECTION_ID,
      queries
    );

    return NextResponse.json({
      success: true,
      notes: response.documents,
      total: response.total,
    });
  } catch (error) {
    console.error("Fetch notes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized - No session found" },
        { status: 401 }
      );
    }

    // Parse session data to get user ID
    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (error) {
      console.error("Session parse error:", error);
      return NextResponse.json(
        { error: "Invalid session format" },
        { status: 401 }
      );
    }

    const userId = sessionData.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid session - user ID not found" },
        { status: 401 }
      );
    }

    const { title, content, source_type, source_url, file_id, tags } =
      await request.json();

    // Validate required fields
    if (!title || !content || !source_type) {
      return NextResponse.json(
        { error: "Title, content, and source_type are required" },
        { status: 400 }
      );
    }

    // Validate source_type
    const validSourceTypes = ["pdf", "youtube", "manual"];
    if (!validSourceTypes.includes(source_type)) {
      return NextResponse.json(
        {
          error: `Invalid source_type. Must be one of: ${validSourceTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Create admin client
    const { Client, Databases, ID } = await import("node-appwrite");
    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    const now = new Date().toISOString();

    // Create note
    const note = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_PERSONAL_NOTES_COLLECTION_ID,
      ID.unique(),
      {
        user_id: userId,
        title,
        content,
        source_type,
        source_url: source_url || null,
        file_id: file_id || null,
        tags: tags || [],
        created_at: now,
        updated_at: now,
      }
    );

    return NextResponse.json({
      success: true,
      note: note,
    });
  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create note" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized - No session found" },
        { status: 401 }
      );
    }

    // Parse session data to get user ID
    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (error) {
      console.error("Session parse error:", error);
      return NextResponse.json(
        { error: "Invalid session format" },
        { status: 401 }
      );
    }

    const userId = sessionData.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid session - user ID not found" },
        { status: 401 }
      );
    }

    const { noteId, title, content, tags } = await request.json();

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    // Create admin client
    const { Client, Databases } = await import("node-appwrite");
    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Get existing note to verify ownership
    const existingNote = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_PERSONAL_NOTES_COLLECTION_ID,
      noteId
    );

    if (existingNote.user_id !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this note" },
        { status: 403 }
      );
    }

    // Build update object
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (tags !== undefined) updateData.tags = tags;

    // Update note
    const updatedNote = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_PERSONAL_NOTES_COLLECTION_ID,
      noteId,
      updateData
    );

    return NextResponse.json({
      success: true,
      note: updatedNote,
    });
  } catch (error) {
    console.error("Update note error:", error);

    if (error.code === 404) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update note" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Verify user is authenticated
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized - No session found" },
        { status: 401 }
      );
    }

    // Parse session data to get user ID
    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch (error) {
      console.error("Session parse error:", error);
      return NextResponse.json(
        { error: "Invalid session format" },
        { status: 401 }
      );
    }

    const userId = sessionData.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid session - user ID not found" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    // Create admin client
    const { Client, Databases } = await import("node-appwrite");
    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    // Get existing note to verify ownership
    const existingNote = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_PERSONAL_NOTES_COLLECTION_ID,
      noteId
    );

    if (existingNote.user_id !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this note" },
        { status: 403 }
      );
    }

    // Delete note
    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_PERSONAL_NOTES_COLLECTION_ID,
      noteId
    );

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);

    if (error.code === 404) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete note" },
      { status: 500 }
    );
  }
}
