"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Eye,
  File,
  FileImage,
  FileCode,
  FileArchive,
  MoreVertical,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import api from "../../utils/enhancedApi";
import { useToast } from "../ToastProvider";
import { Storage, ID } from "appwrite";
import { createRealtimeClient } from "../../lib/appwrite";
import { BUCKET_ID } from "../../lib/appwrite-config";
import FilePreviewModal from "./FilePreviewModal";
import { trackFileUpload } from "../../utils/activityTracker";
import { getFileTypeInfo } from "../../lib/utils";

const GroupFiles = ({ group, onRefresh }) => {
  const { user } = useSelector(state => state.auth);
  const { showSuccess, showError } = useToast();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/${group.id}/files`);
      // Handle both direct response and response.data
      setFiles(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      showError("Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [group.id, showError]);

  useEffect(() => {
    // Fetch files only once on mount
    const loadFiles = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/groups/${group.id}/files`);
        setFiles(Array.isArray(response) ? response : response.data || []);
      } catch (error) {
        console.error("Error fetching files:", error);
        showError("Failed to load files");
      } finally {
        setLoading(false);
      }
    };

    loadFiles();

    // Set up real-time subscription for file updates
    const client = createRealtimeClient();

    try {
      const channelName = `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_APPWRITE_GROUP_FILES_COLLECTION_ID}.documents`;

      const unsubscribe = client.subscribe([channelName], response => {
        const payload = response.payload;

        // Check if the event is for our group
        const isForThisGroup =
          payload.group_id === group.id || payload.group_id === group.$id;

        if (!isForThisGroup) {
          return;
        }

        const eventType = response.events[0];

        if (eventType.includes(".create")) {
          // New file uploaded - add to list
          setFiles(prev => {
            // Avoid duplicates
            if (prev.some(f => f.$id === payload.$id)) {
              return prev;
            }
            return [payload, ...prev];
          });
        } else if (eventType.includes(".delete")) {
          // File deleted - remove from list
          setFiles(prev => prev.filter(file => file.$id !== payload.$id));
        } else if (eventType.includes(".update")) {
          // File updated - update in list
          setFiles(prev =>
            prev.map(file => (file.$id === payload.$id ? payload : file)),
          );
        }
      });

      // Cleanup subscription on unmount
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up realtime subscription:", error);
    }
  }, [group.id, group.$id, showError]); // Removed fetchFiles from dependencies

  const handleFileSelect = e => {
    const file = e.target.files[0];
    if (file) {
      // Check file size using environment variable (default 50MB)
      const maxFileSize =
        parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 50 * 1024 * 1024;
      if (file.size > maxFileSize) {
        const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
        showError(`File size must be less than ${maxSizeMB}MB`);
        return;
      }
      setFileToUpload(file);
    }
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!fileToUpload) {
      showError("Please select a file");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Initialize Appwrite client for direct upload
      const client = createRealtimeClient();
      const storage = new Storage(client);

      // Generate unique file ID
      const fileId = ID.unique();

      // Upload file directly to Appwrite Storage with progress tracking
      const uploadedFile = await storage.createFile(
        BUCKET_ID,
        fileId,
        fileToUpload,
        undefined, // permissions (use bucket defaults)
        progress => {
          const percentage = Math.round(
            (progress.chunksUploaded / progress.chunksTotal) * 100,
          );
          setUploadProgress(percentage);
        },
      );

      // Now create the database record via API
      const response = await fetch(`/api/groups/${group.id}/files/metadata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_id: uploadedFile.$id,
          filename: fileToUpload.name,
          original_name: fileToUpload.name,
          file_type: fileToUpload.type || "application/octet-stream",
          file_size: fileToUpload.size,
          description: description || "",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create file metadata");
      }

      const fileDoc = await response.json();
      showSuccess("File uploaded successfully!");

      // Track file upload activity
      trackFileUpload(group.id, group.name, fileToUpload.name);

      // Reset form
      setUploadDialogOpen(false);
      setFileToUpload(null);
      setDescription("");
      setUploadProgress(0);

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error uploading file:", error);
      showError("Failed to upload file: " + (error.message || "Unknown error"));
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async file => {
    try {
      const client = createRealtimeClient();
      const storage = new Storage(client);
      const fileId = file.file_id || file.fileId || file.$id;

      if (!fileId) {
        showError("File ID not found");
        return;
      }

      const result = storage.getFileDownload(BUCKET_ID, fileId);

      // Open download link
      window.open(result, "_blank");
      showSuccess("Downloading file...");
    } catch (error) {
      console.error("Error downloading file:", error);
      showError("Failed to download file: " + error.message);
    }
  };

  const handlePreview = file => {
    setPreviewFile(file);
    setPreviewModalOpen(true);
  };

  const handleDelete = async file => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      // Delete via API (backend will handle both storage and database)
      const response = await api.delete(
        `/groups/${group.id}/files/${file.$id}`,
      );

      showSuccess("File deleted successfully");

      // Refresh the file list
      fetchFiles();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error deleting file:", error);
      showError(error.response?.data?.detail || "Failed to delete file");
    }
  };

  const getFileIcon = fileType => {
    const { iconType } = getFileTypeInfo(fileType);
    const iconMap = {
      image: <FileImage className="h-8 w-8 text-blue-500" />,
      pdf: <FileText className="h-8 w-8 text-red-500" />,
      video: <FileText className="h-8 w-8 text-purple-500" />,
      audio: <FileText className="h-8 w-8 text-pink-500" />,
      code: <FileCode className="h-8 w-8 text-green-500" />,
      document: <FileText className="h-8 w-8 text-blue-700" />,
      spreadsheet: <FileText className="h-8 w-8 text-green-700" />,
      presentation: <FileText className="h-8 w-8 text-orange-700" />,
      archive: <FileArchive className="h-8 w-8 text-orange-500" />,
      file: <File className="h-8 w-8 text-gray-500" />,
    };
    return iconMap[iconType] || <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = bytes => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = dateString => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredFiles = files.filter(
    file =>
      file.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Group Files</CardTitle>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload File to Group</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="file">
                      Select File (Max{" "}
                      {Math.round(
                        (parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) ||
                          50 * 1024 * 1024) /
                          (1024 * 1024),
                      )}
                      MB)
                    </Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileSelect}
                      required
                      className="mt-1"
                    />
                    {fileToUpload && (
                      <p className="text-sm text-gray-600 mt-1">
                        {fileToUpload.name} ({formatFileSize(fileToUpload.size)}
                        )
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Add a description for this file"
                      className="mt-1"
                    />
                  </div>
                  {uploading && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={uploading || !fileToUpload}
                      className="bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-600 text-center">
              {searchQuery
                ? "No files found matching your search"
                : "No files uploaded yet"}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setUploadDialogOpen(true)}
                variant="outline"
                className="mt-4"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload First File
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map(file => (
            <Card
              key={file.$id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePreview(file)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.file_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{file.filename}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(file.file_size)}
                    </p>
                    {file.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {file.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span suppressHydrationWarning>
                        {formatDate(file.uploaded_at)}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      onClick={e => e.stopPropagation()}
                    >
                      <DropdownMenuItem onClick={() => handlePreview(file)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(file)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewFile(null);
        }}
      />
    </div>
  );
};

export default GroupFiles;
