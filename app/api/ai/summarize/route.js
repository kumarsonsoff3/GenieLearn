import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import { createSessionClient } from "@/lib/appwrite-server";
import PDFParser from "pdf2json";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

    const { fileId, fileName, fileType } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
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

    // Create admin client for file access
    const { Client, Storage } = await import("node-appwrite");
    const client = new Client();
    client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const storage = new Storage(client);

    // Download the file from Appwrite Storage
    const fileBuffer = await storage.getFileDownload(
      process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
      fileId
    );

    // Convert ArrayBuffer to Buffer for processing
    const buffer = Buffer.from(fileBuffer);

    // Convert buffer to text based on file type
    let fileContent = "";
    const lowerFileName = (fileName || "").toLowerCase();

    if (
      fileType?.includes("text") ||
      lowerFileName.endsWith(".txt") ||
      lowerFileName.endsWith(".md")
    ) {
      // Plain text files
      fileContent = buffer.toString("utf-8");
    } else if (
      fileType === "application/pdf" ||
      lowerFileName.endsWith(".pdf")
    ) {
      // Extract text from PDF using pdf2json
      try {
        fileContent = await new Promise((resolve, reject) => {
          const pdfParser = new PDFParser();

          pdfParser.on("pdfParser_dataError", errData => {
            reject(new Error(errData.parserError));
          });

          pdfParser.on("pdfParser_dataReady", pdfData => {
            try {
              // Extract text from all pages
              let text = "";
              if (pdfData.Pages) {
                pdfData.Pages.forEach(page => {
                  if (page.Texts) {
                    page.Texts.forEach(textItem => {
                      if (textItem.R) {
                        textItem.R.forEach(run => {
                          if (run.T) {
                            // Decode URI encoded text
                            text += decodeURIComponent(run.T) + " ";
                          }
                        });
                      }
                    });
                    text += "\n";
                  }
                });
              }
              resolve(text.trim());
            } catch (parseError) {
              reject(parseError);
            }
          });

          // Parse the PDF buffer
          pdfParser.parseBuffer(buffer);
        });
      } catch (pdfError) {
        console.error("PDF parsing error:", pdfError);
        return NextResponse.json(
          {
            error:
              "Failed to extract text from PDF. The file may be corrupted or image-based.",
          },
          { status: 400 }
        );
      }
    } else if (
      fileType?.includes("word") ||
      fileType?.includes("document") ||
      lowerFileName.match(/\.(doc|docx)$/)
    ) {
      // For Word documents, we'll need to extract text
      // Note: For production, consider using mammoth or similar library
      return NextResponse.json(
        {
          error:
            "Word document text extraction requires additional setup. Install 'mammoth' package for DOCX support.",
        },
        { status: 501 }
      );
    } else {
      return NextResponse.json(
        {
          error:
            "File type not supported for summarization. Currently supported: TXT, PDF",
        },
        { status: 400 }
      );
    }

    // Limit content length to avoid token limits (approximately 30,000 characters)
    if (fileContent.length > 30000) {
      fileContent =
        fileContent.substring(0, 30000) +
        "\n\n[Content truncated due to length...]";
    }

    if (!fileContent.trim()) {
      return NextResponse.json(
        { error: "File appears to be empty or content could not be extracted" },
        { status: 400 }
      );
    }

    // Generate summary using Gemini 2.5 Flash (stable version)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `Please provide a clear and concise summary of the following document. Include the main points, key takeaways, and any important details. Keep the summary well-structured and easy to understand.

Document: ${fileName || "Untitled"}

Content:
${fileContent}

Summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({
      success: true,
      summary: summary,
      fileName: fileName,
      fileType: fileType,
    });
  } catch (error) {
    console.error("AI Summarization Error:", error);

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
      { error: error.message || "Failed to generate summary" },
      { status: 500 }
    );
  }
}
