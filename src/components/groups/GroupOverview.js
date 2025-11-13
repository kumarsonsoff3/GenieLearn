"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import {
  Users,
  FileText,
  MessageCircle,
  Calendar,
  Clock,
  Crown,
  Globe,
  Lock,
  Activity,
  Download,
  Image as ImageIcon,
  FileCode,
  FileArchive,
  File as FileIcon,
} from "lucide-react";
import api from "../../utils/enhancedApi";
import { LoadingSpinner } from "../ui/loading-spinner";
import FilePreviewModal from "./FilePreviewModal";
import { getFileTypeInfo } from "../../lib/utils";
import YouTubeSummaryCard from "../dashboard/YouTubeSummaryCard";

const GroupOverview = ({ group, isCreator, onNavigateToTab }) => {
  const { user } = useSelector(state => state.auth);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [memberCount, setMemberCount] = useState(group.member_count || 0);

  const fetchRecentFiles = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch recent files
      const filesData = await api.get(`/groups/${group.id}/files`);
      const files = Array.isArray(filesData) ? filesData : filesData.data || [];
      // Get last 5 files
      setRecentFiles(files.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent files:", error);
    } finally {
      setLoading(false);
    }
  }, [group.id]);

  const fetchMemberCount = useCallback(async () => {
    try {
      const response = await api.get(`/groups/${group.id}/members`);
      const members = response.data || [];
      setMemberCount(members.length);
    } catch (error) {
      console.error("Error fetching member count:", error);
      // Fallback to group.member_count if API fails
      setMemberCount(group.member_count || 0);
    }
  }, [group.id, group.member_count]);

  useEffect(() => {
    fetchRecentFiles();
    fetchMemberCount();
  }, [fetchRecentFiles, fetchMemberCount]);

  const handlePreviewFile = file => {
    setPreviewFile(file);
    setPreviewModalOpen(true);
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTimeAgo = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  const getFileIcon = fileType => {
    const { iconType } = getFileTypeInfo(fileType);
    const iconMap = {
      image: <ImageIcon className="h-5 w-5 text-blue-500" />,
      pdf: <FileText className="h-5 w-5 text-red-500" />,
      video: <FileText className="h-5 w-5 text-purple-500" />,
      audio: <FileText className="h-5 w-5 text-pink-500" />,
      code: <FileCode className="h-5 w-5 text-green-500" />,
      document: <FileText className="h-5 w-5 text-blue-700" />,
      spreadsheet: <FileText className="h-5 w-5 text-green-700" />,
      presentation: <FileText className="h-5 w-5 text-orange-700" />,
      archive: <FileArchive className="h-5 w-5 text-orange-500" />,
      file: <FileIcon className="h-5 w-5 text-gray-400" />,
    };
    return iconMap[iconType] || <FileIcon className="h-5 w-5 text-gray-400" />;
  };

  const formatFileSize = bytes => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content - Left Side (2/3) */}
      <div className="lg:col-span-2 space-y-6">
        {/* About Section - README style */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              README.md
            </h2>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {group.description || "No description provided for this group."}
            </p>
          </div>
        </div>

        {/* YouTube Summary Card */}
        <YouTubeSummaryCard />

        {/* Recent Files Section */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold">Recent Files</h2>
              {recentFiles.length > 0 && (
                <Badge variant="secondary">{recentFiles.length}</Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateToTab && onNavigateToTab("files")}
            >
              View all →
            </Button>
          </div>

          <div className="divide-y">
            {recentFiles.length === 0 ? (
              <div className="text-center py-12 px-6">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 mb-2">No files uploaded yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Upload files to share resources with group members
                </p>
                <Button
                  size="sm"
                  onClick={() => onNavigateToTab && onNavigateToTab("files")}
                >
                  Upload File
                </Button>
              </div>
            ) : (
              recentFiles.map(file => (
                <div
                  key={file.$id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handlePreviewFile(file)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getFileIcon(file.file_type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {file.filename || file.original_name}
                          </h3>
                          {file.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                              {file.description}
                            </p>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {formatFileSize(file.file_size)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>
                          {formatTimeAgo(file.uploaded_at || file.upload_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Right Side (1/3) */}
      <div className="space-y-6">
        {/* About Card */}
        <div className="bg-white rounded-lg border p-5">
          <h3 className="font-semibold text-sm mb-4">About</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {group.is_public ? (
                <Globe className="h-4 w-4 text-gray-600 mt-0.5" />
              ) : (
                <Lock className="h-4 w-4 text-gray-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {group.is_public ? "Public" : "Private"} group
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {group.is_public
                    ? "Anyone can see this group"
                    : "Only members can access"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {memberCount} {memberCount === 1 ? "member" : "members"}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-blue-600"
                  onClick={() => onNavigateToTab && onNavigateToTab("members")}
                >
                  View all members →
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {formatDate(group.$createdAt || group.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Activity className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Last updated
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {formatTimeAgo(
                    group.$updatedAt || group.updated_at || group.$createdAt
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg border p-5">
          <h3 className="font-semibold text-sm mb-4">Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MessageCircle className="h-4 w-4" />
                <span>Messages</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {group.message_count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>Files</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {group.file_count || 0}
              </span>
            </div>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-blue-600 w-full justify-start"
              onClick={() => onNavigateToTab && onNavigateToTab("insights")}
            >
              View detailed insights →
            </Button>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-lg border p-5">
          <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => onNavigateToTab && onNavigateToTab("chat")}
            >
              <MessageCircle className="h-4 w-4" />
              Start chatting
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => onNavigateToTab && onNavigateToTab("files")}
            >
              <FileText className="h-4 w-4" />
              Upload file
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => onNavigateToTab && onNavigateToTab("members")}
            >
              <Users className="h-4 w-4" />
              Invite members
            </Button>
          </div>
        </div>
      </div>

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

export default GroupOverview;
