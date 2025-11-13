"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { getCurrentUser } from "../store/authSlice";
import { Button } from "../components/ui/button";
import api from "../utils/enhancedApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import Layout from "../components/Layout";
import { CreateGroupModal } from "../components/shared";
import FilePreviewModal from "../components/groups/FilePreviewModal";
import YouTubeSummaryCard from "../components/dashboard/YouTubeSummaryCard";
import PersonalNotes from "../components/dashboard/PersonalNotes";
import { formatStudyTime, getTimeAgo, getFileTypeInfo } from "../lib/utils";
import {
  Users,
  MessageCircle,
  Clock,
  Plus,
  ArrowRight,
  BookOpen,
  Brain,
  FileText,
  Activity,
  Search,
  File,
  Download,
  Image,
  Video,
  FileArchive,
  FileCode,
  Sparkles,
} from "lucide-react";
import useStats from "../hooks/useStats";
import { getRecentActivities } from "../utils/activityTracker";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated, isInitializing } = useSelector(
    state => state.auth
  );
  const { stats: userStats, loading: statsLoading, refreshStats } = useStats();
  const [myGroups, setMyGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [allFiles, setAllFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [showAllFiles, setShowAllFiles] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !user && !loading && !isInitializing) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user, isAuthenticated, loading, isInitializing]);

  const fetchMyGroups = useCallback(async () => {
    try {
      setGroupsLoading(true);
      const response = await api.get("/groups/my-groups", { skipCache: true });
      setMyGroups(response.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setMyGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  const fetchAllFiles = useCallback(async () => {
    try {
      setFilesLoading(true);
      // Fetch files from all groups the user is part of
      const myGroupsResponse = await api.get("/groups/my-groups", {
        skipCache: true,
      });
      const groups = myGroupsResponse.data || [];

      // Fetch files from each group
      const filesPromises = groups.map(async group => {
        try {
          const response = await api.get(
            `/groups/${group.id || group.$id}/files`,
            { skipCache: true }
          );
          return (response.data || []).map(file => ({
            ...file,
            groupName: group.name,
            groupId: group.id || group.$id,
          }));
        } catch (error) {
          console.error(`Error fetching files for group ${group.id}:`, error);
          return [];
        }
      });

      const filesArrays = await Promise.all(filesPromises);
      const allFilesFlat = filesArrays.flat();

      // Sort by upload date, most recent first
      allFilesFlat.sort((a, b) => {
        const dateA = new Date(a.uploaded_at || a.$createdAt);
        const dateB = new Date(b.uploaded_at || b.$createdAt);
        return dateB - dateA;
      });

      setAllFiles(allFilesFlat);
    } catch (error) {
      console.error("Error fetching files:", error);
      setAllFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchMyGroups();
      fetchAllFiles();
    }
  }, [user?.id, fetchMyGroups, fetchAllFiles]);

  const fetchRecentActivity = useCallback(async () => {
    try {
      setActivityLoading(true);

      // Get real activities from localStorage
      const storedActivities = getRecentActivities(5);

      // Map activity types to icons
      const getActivityIcon = type => {
        switch (type) {
          case "focus":
            return Brain;
          case "message":
            return MessageCircle;
          case "group_join":
          case "group_create":
          case "group":
            return Users;
          case "file_upload":
            return FileText;
          case "profile_update":
            return BookOpen;
          default:
            return Activity;
        }
      };

      // Transform stored activities to display format
      const activities = storedActivities.map(activity => ({
        id: activity.id,
        type: activity.type,
        icon: getActivityIcon(activity.type),
        message: activity.message,
        detail: activity.detail,
        timestamp: new Date(activity.timestamp),
        groupId: activity.groupId,
      }));

      setRecentActivity(activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
      setRecentActivity([]);
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id && !groupsLoading && !statsLoading) {
      fetchRecentActivity();
    }
  }, [user?.id, groupsLoading, statsLoading, fetchRecentActivity]);

  // Filter files based on search query
  const filteredFiles = allFiles.filter(file => {
    if (!fileSearchQuery) return true;
    const query = fileSearchQuery.toLowerCase();
    return (
      file.filename?.toLowerCase().includes(query) ||
      file.original_name?.toLowerCase().includes(query) ||
      file.groupName?.toLowerCase().includes(query) ||
      file.uploader_name?.toLowerCase().includes(query)
    );
  });

  const displayedFiles = showAllFiles
    ? filteredFiles
    : filteredFiles.slice(0, 5);

  // Helper function to format file size
  const formatFileSize = bytes => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Helper function to get file icon component
  const getFileIcon = fileType => {
    const { iconType } = getFileTypeInfo(fileType);
    const iconMap = {
      image: Image,
      pdf: FileText,
      video: Video,
      audio: FileText,
      code: FileCode,
      document: FileText,
      spreadsheet: FileText,
      presentation: FileText,
      archive: FileArchive,
      file: File,
    };
    return iconMap[iconType] || File;
  };

  if (loading || isInitializing) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0] || "Student"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track your learning progress and connect with study groups
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Groups</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {statsLoading ? "-" : userStats.groupsJoined}
                      </p>
                    </div>
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Messages</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {statsLoading ? "-" : userStats.messagesSent}
                      </p>
                    </div>
                    <MessageCircle className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Study Time</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {statsLoading
                          ? "-"
                          : formatStudyTime(userStats.totalStudyMinutes)}
                      </p>
                    </div>
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Summarizer Section - Featured */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-gray-900">
                      AI YouTube Summarizer
                    </CardTitle>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Get instant AI-powered video summaries
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <YouTubeSummaryCard compact={true} />
              </CardContent>
            </Card>

            {/* Personal Notes Section */}
            <PersonalNotes limit={6} showCreateButton={false} />

            {/* Recent Files */}
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Recent files
                  </CardTitle>
                  {allFiles.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllFiles(!showAllFiles)}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      {showAllFiles
                        ? "Show less"
                        : `View all (${allFiles.length})`}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={fileSearchQuery}
                    onChange={e => setFileSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {filesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  </div>
                ) : displayedFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      {fileSearchQuery
                        ? "No files found"
                        : "No files uploaded yet"}
                    </p>
                    {!fileSearchQuery && (
                      <p className="text-xs text-gray-500">
                        Files uploaded to your groups will appear here
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayedFiles.map(file => {
                      const FileIcon = getFileIcon(file.file_type);
                      return (
                        <div
                          key={file.$id || file.id}
                          onClick={() => {
                            setPreviewFile(file);
                            setPreviewModalOpen(true);
                          }}
                          className="flex items-center justify-between p-3 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <FileIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.filename || file.original_name}
                              </p>
                              <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <Link
                                  href={`/groups/${file.groupId}`}
                                  onClick={e => e.stopPropagation()}
                                  className="truncate hover:text-blue-600 hover:underline"
                                >
                                  {file.groupName}
                                </Link>
                                <span>•</span>
                                <span>{formatFileSize(file.file_size)}</span>
                                {file.uploader_name && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">
                                      {file.uploader_name}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <a
                            href={`/api/storage/${
                              file.file_id || file.$id
                            }/download`}
                            onClick={e => e.stopPropagation()}
                            className="ml-2 p-1.5 rounded hover:bg-gray-100 flex-shrink-0"
                            title="Download file"
                          >
                            <Download className="h-4 w-4 text-gray-500" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Groups */}
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Your groups
                  </CardTitle>
                  <Link href="/groups">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      View all
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {groupsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  </div>
                ) : myGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-3">
                      You haven&apos;t joined any groups yet
                    </p>
                    <Link href="/groups">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-gray-900 hover:bg-gray-800"
                      >
                        Explore groups
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myGroups.slice(0, 5).map(group => (
                      <Link
                        key={group.id || group.$id}
                        href={`/groups/${group.id || group.$id}`}
                      >
                        <div className="flex items-center justify-between p-3 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="h-8 w-8 rounded bg-gray-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {group.name?.charAt(0).toUpperCase() || "G"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {group.name}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {group.member_count || 0} members
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                    {myGroups.length > 5 && (
                      <Link href="/groups">
                        <div className="text-center pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            View {myGroups.length - 5} more group
                            {myGroups.length - 5 > 1 ? "s" : ""}
                          </Button>
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {user?.subjects_of_interest &&
                user.subjects_of_interest.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">
                      Interests
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {user.subjects_of_interest
                        .slice(0, 3)
                        .map((subject, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            {subject}
                          </Badge>
                        ))}
                      {user.subjects_of_interest.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gray-100 text-gray-700"
                        >
                          +{user.subjects_of_interest.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : null}

                <Link href="/profile" className="block mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-gray-300 hover:bg-gray-50"
                  >
                    Edit profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-200 pb-4">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-gray-600" />
                  <span>Recent activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {activityLoading ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-6">
                    <Activity className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No recent activity</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Start by joining a group!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map(activity => {
                      const Icon = activity.icon;
                      const timeAgo = getTimeAgo(activity.timestamp);

                      const ActivityContent = (
                        <div className="flex items-start space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <Icon className="h-4 w-4 text-gray-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.message}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {activity.detail}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {timeAgo}
                            </p>
                          </div>
                        </div>
                      );

                      // If activity has a groupId, make it clickable
                      if (activity.groupId) {
                        return (
                          <Link
                            key={activity.id}
                            href={`/groups/${activity.groupId}`}
                          >
                            {ActivityContent}
                          </Link>
                        );
                      }

                      // For focus activity, link to focus page
                      if (activity.type === "focus") {
                        return (
                          <Link key={activity.id} href="/focus">
                            {ActivityContent}
                          </Link>
                        );
                      }

                      // For profile activity, link to profile page
                      if (activity.type === "profile") {
                        return (
                          <Link key={activity.id} href="/profile">
                            {ActivityContent}
                          </Link>
                        );
                      }

                      return <div key={activity.id}>{ActivityContent}</div>;
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-gray-200">
              <CardHeader className="border-b border-gray-200 pb-4">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Quick actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Link href="/focus">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-2.5 px-3 border border-gray-300 hover:bg-gray-50"
                    >
                      <Brain className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Focus Mode
                      </span>
                    </Button>
                  </Link>

                  <Link href="/groups">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-2.5 px-3 border border-gray-300 hover:bg-gray-50"
                    >
                      <Users className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Browse Groups
                      </span>
                    </Button>
                  </Link>

                  <CreateGroupModal
                    trigger={
                      <Button
                        variant="outline"
                        className="w-full justify-start h-auto py-2.5 px-3 border border-gray-300 hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          New Group
                        </span>
                      </Button>
                    }
                    onGroupCreated={refreshStats}
                  />

                  <Link href="/profile">
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto py-2.5 px-3 border border-gray-300 hover:bg-gray-50"
                    >
                      <BookOpen className="h-4 w-4 mr-2 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Update Profile
                      </span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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
    </Layout>
  );
};

export default Dashboard;
