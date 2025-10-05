"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Download, ExternalLink, FileText, AlertCircle } from "lucide-react";

const FilePreviewModal = ({ file, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!file) return null;

  // Get the actual storage file ID
  const getStorageFileId = () => {
    const fileId = file.file_id || file.fileId || file.$id;
    console.log("Resolved file ID:", fileId);
    return fileId;
  };

  // Get file URL from Appwrite via our API
  const getFileUrl = () => {
    try {
      const storageFileId = getStorageFileId();

      if (!storageFileId) {
        console.error("No file ID found:", file);
        return null;
      }

      // Use our API endpoint that handles authentication
      const url = `/api/storage/${storageFileId}/view`;
      console.log("File view URL:", url);
      return url;
    } catch (err) {
      console.error("Error getting file URL:", err, file);
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
      console.log("Download URL:", downloadUrl);
      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error("Error downloading file:", err, file);
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
          <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-4">
            {error ? (
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-400 mb-4 mx-auto" />
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Image
                </Button>
              </div>
            ) : (
              <img
                src={fileUrl}
                alt={file.filename || file.original_name}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setLoading(false)}
                onError={() => {
                  setLoading(false);
                  setError("Failed to load image");
                }}
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
          <div className="flex items-center justify-center h-full bg-black p-4">
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
          <div className="flex flex-col items-center justify-center h-full p-8">
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate pr-4">
              {file.filename || file.original_name}
            </DialogTitle>
            <div className="flex items-center gap-2">
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

        {/* Preview Area */}
        <div className="relative flex-1 overflow-hidden">
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
        <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-600">
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
