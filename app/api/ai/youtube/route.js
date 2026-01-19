import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Extract YouTube video ID from URL
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export async function POST(request) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "AI service not configured. Please add GEMINI_API_KEY to environment variables.",
        },
        { status: 503 },
      );
    }

    const { youtubeUrl } = await request.json();

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 },
      );
    }

    // Verify user is authenticated
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized - No session found" },
        { status: 401 },
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
        { status: 401 },
      );
    }

    const userId = sessionData.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid session - user ID not found" },
        { status: 401 },
      );
    }

    // Extract video ID
    const videoId = extractVideoId(youtubeUrl);

    if (!videoId) {
      return NextResponse.json(
        {
          error:
            "Invalid YouTube URL. Please provide a valid YouTube video link.",
        },
        { status: 400 },
      );
    }

    const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[YouTube API] Processing video: ${normalizedUrl}`);

    // Use Gemini 2.5 Flash with native YouTube support
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    const prompt = `You are an expert educational content summarizer. Analyze this YouTube video and create a comprehensive, well-structured summary in markdown format.

Your summary should include:

# Video Summary

## 📋 Overview
(Provide a brief 2-3 sentence overview of the video's main topic and purpose)

## 🎯 Key Points
(List 5-7 most important takeaways as bullet points)

## 📝 Detailed Notes

### Main Topics
(Break down the content into logical sections with clear headings. Use subheadings where appropriate. Include important details, examples, and explanations.)

### Important Concepts
(Highlight key concepts, terminology, or ideas explained in the video)

### Practical Insights
(Include any actionable advice, tips, or practical applications mentioned)

## 💡 Conclusion
(Summarize the main message and value of the video in 2-3 sentences)

## 🔖 Tags
(Suggest 5-7 relevant tags for categorizing this content)

Please format your response using proper markdown with headings (##, ###), bullet points (-), numbered lists (1., 2., 3.), **bold**, and *italic* where appropriate to make it easy to read and understand.

Also, at the very beginning of your response, provide the video title in this exact format:
VIDEO_TITLE: [actual video title here]

Then continue with the summary.`;

    // Send YouTube URL directly to Gemini - it handles the video natively!
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "video/mp4",
          fileUri: normalizedUrl,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const fullText = response.text();

    // Extract video title from response
    let videoTitle = "YouTube Video";
    let summary = fullText;

    const titleMatch = fullText.match(/VIDEO_TITLE:\s*(.+?)(?:\n|$)/);
    if (titleMatch) {
      videoTitle = titleMatch[1].trim();
      // Remove the title line from the summary
      summary = fullText.replace(/VIDEO_TITLE:\s*.+?\n/, "").trim();
    }

    console.log(`[YouTube API] Successfully summarized: ${videoTitle}`);

    return NextResponse.json({
      success: true,
      summary: summary,
      videoTitle: videoTitle,
      videoId: videoId,
      youtubeUrl: normalizedUrl,
    });
  } catch (error) {
    console.error("YouTube Summarization Error:", error);

    // Handle specific Gemini API errors
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        {
          error:
            "Invalid API key. Please check your GEMINI_API_KEY configuration.",
        },
        { status: 503 },
      );
    }

    if (
      error.message?.includes("quota") ||
      error.message?.includes("rate limit")
    ) {
      return NextResponse.json(
        { error: "AI service quota exceeded. Please try again later." },
        { status: 429 },
      );
    }

    if (
      error.message?.includes("video") ||
      error.message?.includes("YouTube") ||
      error.message?.includes("could not")
    ) {
      return NextResponse.json(
        {
          error:
            "Could not process this YouTube video. This could be because:\n\n" +
            "• The video is private, age-restricted, or unavailable\n" +
            "• The video is too long (try videos under 1 hour)\n" +
            "• The video has restrictions that prevent analysis\n\n" +
            "Please try a different video.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate video summary" },
      { status: 500 },
    );
  }
}
