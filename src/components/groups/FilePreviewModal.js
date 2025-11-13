"use client";

import React, { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Download,
  ExternalLink,
  FileText,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  BookmarkPlus,
  CheckCircle2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { trackNoteCreate } from "../../utils/activityTracker";

const FilePreviewModal = ({ file, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  if (!file) return null;

  // Reset summary when file changes
  const fileId = file.$id || file.id || file.file_id;
  if (fileId !== currentFileId) {
    setCurrentFileId(fileId);
    setSummary(null);
    setSummaryError(null);
    setSummaryOpen(false);
    setLoading(true);
    setError(null);
    setSavingNote(false);
    setNoteSaved(false);
  }

  // Handle saving summary to notes
  const handleSaveToNotes = async () => {
    if (!summary) return;

    setSavingNote(true);
    setSummaryError(null);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `PDF Summary - ${file.filename || file.original_name}`,
          content: summary,
          source_type: "pdf",
          file_id: getStorageFileId(),
          tags: ["pdf", "summary"],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save note");
      }

      const data = await response.json();

      // Track activity
      if (data.note) {
        trackNoteCreate(data.note.$id, data.note.title, "pdf");
      }

      setNoteSaved(true);

      // Reset saved state after 3 seconds
      setTimeout(() => {
        setNoteSaved(false);
      }, 3000);
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSavingNote(false);
    }
  };

  // Handle AI summarization
  const handleSummarize = async () => {
    setSummarizing(true);
    setSummaryError(null);
    setSummary(null);

    try {
      const storageFileId = getStorageFileId();
      if (!storageFileId) {
        throw new Error("File ID not found");
      }

      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileId: storageFileId,
          fileName: file.filename || file.original_name,
          fileType: file.file_type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to summarize file");
      }

      const data = await response.json();
      setSummary(data.summary);
      setSummaryOpen(true);
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSummarizing(false);
    }
  };

  // Get the actual storage file ID
  const getStorageFileId = () => {
    const fileId = file.file_id || file.fileId || file.$id;
    return fileId;
  };

  // Get file URL from Appwrite via our API
  const getFileUrl = () => {
    try {
      const storageFileId = getStorageFileId();

      if (!storageFileId) {
        return null;
      }

      // Use our API endpoint that handles authentication
      const url = `/api/storage/${storageFileId}/view`;
      return url;
    } catch (err) {
      return null;
    }
  };

  const handleDownload = () => {
    try {
      const storageFileId = getStorageFileId();

      if (!storageFileId) {
        setError("File ID not found");
        return;
      }

      // Use our API endpoint for authenticated download
      const downloadUrl = `/api/storage/${storageFileId}/download`;
      window.open(downloadUrl, "_blank");
    } catch (err) {
      setError("Failed to download file");
    }
  };

  const openInNewTab = () => {
    const fileUrl = getFileUrl();
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  // Determine if file can be previewed
  const getPreviewType = () => {
    const fileType = file.file_type || "";
    const fileName = (file.filename || file.original_name || "").toLowerCase();

    // Images
    if (
      fileType.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(fileName)
    ) {
      return "image";
    }

    // PDFs
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      return "pdf";
    }

    // Documents (using Google Drive Viewer)
    if (
      /\.(doc|docx|xls|xlsx|ppt|pptx|txt|rtf|odt|ods|odp)$/i.test(fileName) ||
      fileType.includes("word") ||
      fileType.includes("excel") ||
      fileType.includes("powerpoint") ||
      fileType.includes("text")
    ) {
      return "document";
    }

    // Videos
    if (
      fileType.startsWith("video/") ||
      /\.(mp4|webm|ogg|mov|avi)$/i.test(fileName)
    ) {
      return "video";
    }

    // Audio
    if (
      fileType.startsWith("audio/") ||
      /\.(mp3|wav|ogg|m4a)$/i.test(fileName)
    ) {
      return "audio";
    }

    return "unsupported";
  };

  const previewType = getPreviewType();
  const fileUrl = getFileUrl();

  const renderPreview = () => {
    if (!fileUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
          <p className="text-gray-600 mb-4">Unable to load file preview</p>
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download File
          </Button>
        </div>
      );
    }

    switch (previewType) {
      case "image":
        return (
          <div className="relative w-full h-full bg-gray-100">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="h-16 w-16 text-red-400 mb-4 mx-auto" />
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Image
                  </Button>
                </div>
              </div>
            ) : (
              <Image
                src={fileUrl}
                alt={file.filename || file.original_name}
                fill
                className="object-contain"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError("Failed to load image");
                }}
                unoptimized
              />
            )}
          </div>
        );

      case "pdf":
        return (
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full"
            title={file.filename || file.original_name}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError("Failed to load PDF");
            }}
          />
        );

      case "document":
        // For documents, provide download option since Google Viewer needs public URLs
        // and Appwrite requires authentication
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50">
            <FileText className="h-24 w-24 text-blue-400 mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {file.filename || file.original_name}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Document preview requires downloading the file. Office documents,
              spreadsheets, and presentations can be viewed after downloading.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleDownload} size="lg">
                <Download className="h-5 w-5 mr-2" />
                Download to View
              </Button>
              <Button onClick={openInNewTab} variant="outline" size="lg">
                <ExternalLink className="h-5 w-5 mr-2" />
                Open in New Tab
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              File type: {file.file_type || "Unknown"}
            </p>
          </div>
        );

      case "video":
        return (
          <div className="flex items-center justify-center w-full h-full bg-black">
            <video
              src={fileUrl}
              controls
              className="max-w-full max-h-full"
              onLoadedData={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError("Failed to load video");
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case "audio":
        return (
          <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50">
            <FileText className="h-24 w-24 text-gray-400 mb-6" />
            <h3 className="text-lg font-medium mb-4">
              {file.filename || file.original_name}
            </h3>
            <audio
              src={fileUrl}
              controls
              className="w-full max-w-md"
              onLoadedData={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError("Failed to load audio");
              }}
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case "unsupported":
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Preview not available</h3>
            <p className="text-gray-600 mb-6">
              This file type cannot be previewed in the browser.
              <br />
              Please download the file to view it.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
              <Button onClick={openInNewTab} variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        );
    }
  };

  // Check if file can be summarized
  const canSummarize = () => {
    const fileType = file.file_type || "";
    const fileName = (file.filename || file.original_name || "").toLowerCase();
    return (
      fileType === "application/pdf" ||
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".txt") ||
      fileType.includes("text") ||
      fileType.includes("word") ||
      fileType.includes("document") ||
      /\.(doc|docx|txt|rtf|odt)$/i.test(fileName)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate pr-4">
              {file.filename || file.original_name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {canSummarize() && (
                <Button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200"
                  aria-label={`Summarize ${
                    file.filename || file.original_name
                  } using AI`}
                  title="Generate an AI-powered summary of this document"
                >
                  {summarizing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      Summarize with AI
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                onClick={openInNewTab}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open
              </Button>
            </div>
          </div>
          {file.description && (
            <p className="text-sm text-gray-600 mt-2">{file.description}</p>
          )}
        </DialogHeader>

        {/* AI Summary Section */}
        {(summary || summaryError) && (
          <div className="px-6 py-3 border-b bg-gradient-to-r from-blue-50 to-purple-50 shrink-0">
            <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen}>
              <CollapsibleTrigger
                className="flex items-center justify-between w-full text-left"
                aria-label={
                  summaryOpen ? "Collapse AI summary" : "Expand AI summary"
                }
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900">AI Summary</span>
                </div>
                {summaryOpen ? (
                  <ChevronUp
                    className="h-4 w-4 text-gray-600"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronDown
                    className="h-4 w-4 text-gray-600"
                    aria-hidden="true"
                  />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent
                className="mt-3"
                role="region"
                aria-label="AI-generated summary content"
              >
                {summaryError ? (
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-700 mb-2">
                        {summaryError}
                      </p>
                      <Button
                        onClick={handleSummarize}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        AI-generated summary
                      </span>
                      <Button
                        onClick={handleSaveToNotes}
                        size="sm"
                        variant="outline"
                        disabled={savingNote || noteSaved}
                      >
                        {savingNote ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : noteSaved ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <BookmarkPlus className="h-3 w-3 mr-1" />
                        )}
                        {noteSaved ? "Saved!" : "Save to Notes"}
                      </Button>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-blue-200 shadow-sm max-h-96 overflow-y-auto">
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {summary}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Preview Area */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          ) : (
            renderPreview()
          )}
        </div>

        {/* Footer with file info */}
        <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-600 shrink-0">
          <div className="flex items-center justify-between">
            <span>
              Size:{" "}
              {file.file_size
                ? `${(file.file_size / (1024 * 1024)).toFixed(2)} MB`
                : "Unknown"}
            </span>
            <span>Type: {file.file_type || "Unknown"}</span>
            <span>
              Uploaded:{" "}
              {file.uploaded_at
                ? new Date(file.uploaded_at).toLocaleDateString()
                : "Unknown"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewModal;
