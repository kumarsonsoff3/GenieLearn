import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import { Innertube } from "youtubei.js";

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

// Format duration from seconds to readable format
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
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
        { status: 503 }
      );
    }

    const { youtubeUrl } = await request.json();

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

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

    // Extract video ID
    const videoId = extractVideoId(youtubeUrl);

    if (!videoId) {
      return NextResponse.json(
        {
          error:
            "Invalid YouTube URL. Please provide a valid YouTube video link.",
        },
        { status: 400 }
      );
    }

    // Fetch transcript with multiple language fallback
    let transcript;
    let transcriptText = "";
    let transcriptLanguage = "en";
    let videoTitle = "YouTube Video"; // Default title

    try {
      console.log(`[YouTube API] Fetching transcript for video ID: ${videoId}`);

      // Initialize YouTube client
      const youtube = await Innertube.create();

      // Get video info
      const info = await youtube.getInfo(videoId);

      // Extract video title
      videoTitle = info.basic_info?.title || "YouTube Video";
      console.log(`[YouTube API] Video title: ${videoTitle}`);

      // Get transcript/captions
      const transcriptData = await info.getTranscript();

      if (!transcriptData || !transcriptData.transcript) {
        throw new Error("No transcript available");
      }

      // Extract transcript segments with safe navigation
      const segments =
        transcriptData.transcript.content?.body?.initial_segments;

      if (!segments || segments.length === 0) {
        throw new Error("No transcript segments available");
      }

      transcript = segments
        .map(segment => {
          const runs = segment.snippet?.runs || [];
          return {
            text: runs.map(run => run.text || "").join(""),
            start: (segment.start_ms || 0) / 1000,
            duration: ((segment.end_ms || 0) - (segment.start_ms || 0)) / 1000,
          };
        })
        .filter(seg => seg.text.trim());

      console.log(
        `[YouTube API] Transcript fetched. Segments: ${transcript?.length || 0}`
      );

      if (!transcript || transcript.length === 0) {
        // Try fetching video metadata to provide better error context
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        return NextResponse.json(
          {
            error:
              "No transcript available for this video. This could be because:\n\n" +
              "• The video doesn't have captions/subtitles enabled\n" +
              "• The video is private or age-restricted\n" +
              "• Auto-generated captions are disabled\n\n" +
              "Please try another video that has captions enabled, or ask the video creator to add captions.",
            videoUrl: videoUrl,
            suggestion:
              "Look for videos with the 'CC' (closed captions) icon on YouTube",
          },
          { status: 400 }
        );
      }

      // Combine transcript segments
      transcriptText = transcript.map(segment => segment.text).join(" ");

      // Limit content length to avoid token limits (approximately 50,000 characters)
      if (transcriptText.length > 50000) {
        transcriptText =
          transcriptText.substring(0, 50000) +
          "\n\n[Transcript truncated due to length...]";
      }
    } catch (error) {
      console.error("Transcript fetch error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // Provide detailed error based on error type
      let errorMessage = "Failed to fetch video transcript. ";
      let suggestions = [];
      const errorMsg = error.message?.toLowerCase() || "";

      if (errorMsg.includes("transcript") && errorMsg.includes("disabled")) {
        errorMessage +=
          "The video owner has disabled transcripts for this video.";
        suggestions.push(
          "Try finding a similar video from a different creator"
        );
      } else if (
        errorMsg.includes("unavailable") ||
        errorMsg.includes("not available")
      ) {
        errorMessage += "The video is unavailable, private, or restricted.";
        suggestions.push("Check if the video is public and accessible");
        suggestions.push("Ensure the video exists and is not deleted");
      } else if (
        errorMsg.includes("could not") ||
        errorMsg.includes("no transcript") ||
        errorMsg.includes("no caption")
      ) {
        errorMessage +=
          "No captions or subtitles are available for this video.";
        suggestions.push("Look for videos with the 'CC' icon on YouTube");
        suggestions.push(
          "Try videos from educational channels that typically include captions"
        );
      } else if (errorMsg.includes("cors") || errorMsg.includes("network")) {
        errorMessage += "Network error occurred while fetching the transcript.";
        suggestions.push("Check your internet connection");
        suggestions.push("Try again in a few moments");
      } else {
        errorMessage +=
          "An unexpected error occurred while fetching the transcript.";
        suggestions.push("Verify the YouTube URL is correct and complete");
        suggestions.push("Try a different video with confirmed captions");
        suggestions.push("Check browser console for detailed error logs");
      }

      return NextResponse.json(
        {
          error: errorMessage,
          suggestions: suggestions,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          details: error.message,
          technicalDetails:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        },
        { status: 400 }
      );
    }

    // Generate summary using Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `You are an expert educational content summarizer. Analyze the following YouTube video transcript and create a comprehensive, well-structured summary in markdown format.

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

---

**Video Transcript:**
${transcriptText}

---

Please format your response using proper markdown with headings (##, ###), bullet points (-), numbered lists (1., 2., 3.), **bold**, and *italic* where appropriate to make it easy to read and understand.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({
      success: true,
      summary: summary,
      videoTitle: videoTitle,
      videoId: videoId,
      youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      transcriptLength: transcriptText.length,
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
        { status: 503 }
      );
    }

    if (
      error.message?.includes("quota") ||
      error.message?.includes("rate limit")
    ) {
      return NextResponse.json(
        { error: "AI service quota exceeded. Please try again later." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate video summary" },
      { status: 500 }
    );
  }
}
