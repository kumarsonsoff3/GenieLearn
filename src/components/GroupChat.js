"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Send,
  ArrowLeft,
  Users,
  Crown,
  Paperclip,
  FileText,
  X,
} from "lucide-react";
import api from "../utils/enhancedApi";
import { createRealtimeClient } from "../lib/appwrite";
import { DATABASE_ID, COLLECTIONS } from "../lib/appwrite-config";
import useStats from "../hooks/useStats";
import FilePreviewModal from "./groups/FilePreviewModal";
import { trackMessage } from "../utils/activityTracker";
import { getFileTypeInfo } from "../lib/utils";

const GroupChat = ({ group, onBack, embedded = false }) => {
  const { user } = useSelector(state => state.auth);
  const { incrementMessageCount } = useStats();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // File mention states
  const [groupFiles, setGroupFiles] = useState([]);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [mentionedFiles, setMentionedFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessageHistory = useCallback(async () => {
    try {
      setLoadingMessages(true);
      let allMessages = [];
      let offset = 0;
      const batchSize = 100;
      let hasMore = true;

      // Load messages in batches to get complete chat history
      while (hasMore) {
        const response = await api.get(
          `/groups/${group.id}/messages?limit=${batchSize}&offset=${offset}`
        );
        const batch = response.data;

        if (batch.length === 0 || batch.length < batchSize) {
          // No more messages or last batch
          allMessages.push(...batch);
          hasMore = false;
        } else {
          allMessages.push(...batch);
          offset += batchSize;

          // Safety check to prevent infinite loops (max 5,000 messages)
          if (allMessages.length >= 5000) {
            console.warn(
              "Reached maximum message limit (5,000) for performance"
            );
            hasMore = false;
          }
        }
      }

      const formattedMessages = allMessages.map(msg => {
        let parsedFiles = null;
        if (msg.mentioned_files) {
          try {
            if (typeof msg.mentioned_files === "string") {
              parsedFiles = JSON.parse(msg.mentioned_files);
            } else {
              parsedFiles = msg.mentioned_files;
            }
          } catch (e) {
            console.error(
              "Failed to parse mentioned_files:",
              e,
              msg.mentioned_files
            );
          }
        }
        return {
          ...msg,
          timestamp: new Date(msg.timestamp),
          mentioned_files: parsedFiles,
        };
      });

      // Messages are already sorted by timestamp from API (Query.orderAsc)
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading message history:", error);
      // Fallback: try to load with simple limit if pagination fails
      try {
        const response = await api.get(
          `/groups/${group.id}/messages?limit=1000`
        );
        const formattedMessages = response.data.map(msg => {
          let parsedFiles = null;
          if (msg.mentioned_files) {
            try {
              if (typeof msg.mentioned_files === "string") {
                parsedFiles = JSON.parse(msg.mentioned_files);
              } else {
                parsedFiles = msg.mentioned_files;
              }
            } catch (e) {
              console.error(
                "Fallback: Failed to parse mentioned_files:",
                e,
                msg.mentioned_files
              );
            }
          }

          return {
            ...msg,
            timestamp: new Date(msg.timestamp),
            mentioned_files: parsedFiles,
          };
        });
        setMessages(formattedMessages);
      } catch (fallbackError) {
        console.error("Fallback message loading also failed:", fallbackError);
      }
    } finally {
      setLoadingMessages(false);
    }
  }, [group.id]);

  // Helper function to handle real-time message updates
  const handleRealtimeMessage = useCallback(
    response => {
      if (response.payload?.group_id === group.id) {
        const isCreateEvent = response.events.some(event =>
          event.includes("create")
        );

        if (isCreateEvent) {
          const newMessage = {
            id: response.payload.$id,
            content: response.payload.content,
            group_id: response.payload.group_id,
            sender_id: response.payload.sender_id,
            sender_name: response.payload.sender_name,
            timestamp: new Date(
              response.payload.timestamp || response.payload.$createdAt
            ),
            is_system_message: response.payload.is_system_message || false,
            system_message_type: response.payload.system_message_type || null,
            mentioned_files: response.payload.mentioned_files
              ? typeof response.payload.mentioned_files === "string"
                ? JSON.parse(response.payload.mentioned_files)
                : response.payload.mentioned_files
              : null,
          };

          setMessages(prev => {
            // Check for existing real message
            if (
              prev.some(msg => msg.id === newMessage.id && !msg.isOptimistic)
            ) {
              return prev;
            }

            // Replace optimistic message with same content from same user, or add new message
            const existingOptimistic = prev.find(
              msg =>
                msg.isOptimistic &&
                msg.sender_id === newMessage.sender_id &&
                msg.content === newMessage.content &&
                Math.abs(
                  new Date(msg.timestamp) - new Date(newMessage.timestamp)
                ) < 10000 // Within 10 seconds
            );

            if (existingOptimistic) {
              // Replace optimistic message with real one
              return prev.map(msg =>
                msg.id === existingOptimistic.id ? newMessage : msg
              );
            } else {
              // Add new message
              return [...prev, newMessage].sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
              );
            }
          });
        }
      }
    },
    [group.id]
  );

  // Setup Appwrite Realtime subscription with proper error handling
  useEffect(() => {
    if (!group.id || !user) return; // Only connect if user is authenticated

    const setupRealtime = async () => {
      try {
        // Check if user has server-side authentication first
        const statusResponse = await fetch("/api/auth/status");
        const { hasSession } = await statusResponse.json();

        if (!hasSession) {
          console.log("No server session, skipping realtime connection");
          setIsConnected(false);
          return;
        }

        const realtimeClient = createRealtimeClient();
        const unsubscribe = realtimeClient.subscribe(
          `databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`,
          handleRealtimeMessage
        );

        setIsConnected(true);
        unsubscribeRef.current = unsubscribe;
      } catch (error) {
        console.log("Realtime connection failed:", error);
        setIsConnected(false);

        // Fall back to polling every 5 seconds
        pollingIntervalRef.current = setInterval(() => {
          loadMessageHistory();
        }, 5000);
      }
    };

    setupRealtime();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [group.id, user, handleRealtimeMessage, loadMessageHistory]);

  // Load message history when component mounts
  useEffect(() => {
    loadMessageHistory();
  }, [group.id, loadMessageHistory]);

  // Load group files for mentions
  useEffect(() => {
    const loadGroupFiles = async () => {
      try {
        const response = await api.get(`/groups/${group.id}/files`);
        setGroupFiles(response.data || []);
      } catch (error) {
        console.error("Error loading group files:", error);
      }
    };

    if (group.id) {
      loadGroupFiles();
    }
  }, [group.id]);

  const sendMessage = async e => {
    e.preventDefault();
    if (!newMessage.trim() && mentionedFiles.length === 0) return;

    const messageContent = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    // Optimistic update - clear input immediately for better UX
    setNewMessage("");
    const filesSnapshot = [...mentionedFiles];
    setMentionedFiles([]);
    inputRef.current?.focus();

    // Add optimistic message to UI immediately
    const optimisticMessage = {
      id: tempId,
      content: messageContent,
      group_id: group.id,
      sender_id: user?.id,
      sender_name: user?.name,
      timestamp: new Date(),
      is_system_message: false,
      isOptimistic: true, // Flag to identify optimistic messages
      mentioned_files: filesSnapshot,
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Send message to server (async)
      const response = await api.post("/messages/create", {
        content: messageContent || "Shared files",
        group_id: group.id,
        mentioned_files: filesSnapshot.length > 0 ? filesSnapshot : null,
      });

      // Replace optimistic message with real message when server responds
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId
            ? {
                ...response.data,
                timestamp: new Date(response.data.timestamp),
                isOptimistic: false,
                mentioned_files: filesSnapshot,
              }
            : msg
        )
      );

      // Track message activity
      trackMessage(group.id, group.name);

      // Increment message count for stats
      incrementMessageCount();
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));

      // Restore the message content so user can try again
      setNewMessage(messageContent);
      setMentionedFiles(filesSnapshot);

      // Show error feedback (you might want to add a toast notification here)
      alert("Failed to send message. Please try again.");
    }
  };

  const handleAddFileMention = file => {
    if (!mentionedFiles.find(f => f.id === file.$id)) {
      setMentionedFiles(prev => [
        ...prev,
        {
          id: file.$id,
          file_id: file.file_id, // Appwrite storage file ID
          name: file.filename,
          type: file.file_type,
          size: file.file_size,
        },
      ]);
    }
    setShowFilePicker(false);
  };

  const handleRemoveFileMention = fileId => {
    setMentionedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleFileClick = async file => {
    try {
      // Check if file has the storage file_id needed for preview
      // Mentioned files store: {id, file_id, name, type, size}
      // Full file objects have: {$id, file_id, filename, file_type, file_size}

      if (!file.file_id) {
        // Need to fetch full file data using the document ID
        const fileDocId = file.id || file.$id;

        // Try to find in groupFiles cache first
        const fullFile = groupFiles.find(gf => gf.$id === fileDocId);
        if (fullFile) {
          setPreviewFile(fullFile);
          setShowFilePreview(true);
          return;
        }

        // If not in cache, fetch from API
        const response = await api.get(`/groups/${group.id}/files`);
        const matchedFile = response.data.find(gf => gf.$id === fileDocId);
        if (matchedFile) {
          setPreviewFile(matchedFile);
          setShowFilePreview(true);
        } else {
          alert("File not found");
        }
      } else {
        // File has complete data with file_id
        // Normalize the file object structure for FilePreviewModal
        const normalizedFile = {
          $id: file.$id || file.id,
          file_id: file.file_id,
          filename: file.filename || file.name,
          file_type: file.file_type || file.type,
          file_size: file.file_size || file.size,
          original_name: file.original_name || file.filename || file.name,
        };
        setPreviewFile(normalizedFile);
        setShowFilePreview(true);
      }
    } catch (error) {
      console.error("Error loading file:", error);
      alert("Failed to load file preview: " + error.message);
    }
  };

  const getFileIcon = fileType => getFileTypeInfo(fileType).emoji;

  const handleReconnect = useCallback(() => {
    setIsConnected(false);

    // Clean up existing subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Trigger re-subscription after a brief delay
    setTimeout(async () => {
      try {
        const realtimeClient = createRealtimeClient();
        const unsubscribe = realtimeClient.subscribe(
          `databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`,
          handleRealtimeMessage
        );

        unsubscribeRef.current = unsubscribe;
        setIsConnected(true);
      } catch (error) {
        console.log("Reconnection failed:", error);
        setIsConnected(false);
      }
    }, 1000);
  }, [handleRealtimeMessage]);

  const formatTime = timestamp => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = timestamp => {
    const today = new Date();
    const messageDate = new Date(timestamp);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (
      messageDate.toDateString() ===
      new Date(today.getTime() - 86400000).toDateString()
    ) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header - only show if not embedded */}
      {!embedded && (
        <CardHeader className="flex-row items-center space-y-0 pb-4 border-b bg-gradient-to-r from-blue-50 to-orange-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-3 hover:bg-white/80"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent font-bold">
                {group.name}
              </span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {group.member_count} member{group.member_count !== 1 ? "s" : ""}
              {!isConnected && (
                <>
                  <span className="text-red-500 ml-2 font-medium hover:text-red-600 transition-colors">
                    • Disconnected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReconnect}
                    className="ml-2 text-xs h-6 px-2"
                  >
                    Reconnect
                  </Button>
                </>
              )}
              {isConnected && (
                <span className="text-green-500 ml-2 font-medium hover:text-green-600 transition-colors">
                  • Connected
                </span>
              )}
            </p>
          </div>
        </CardHeader>
      )}

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMessages ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            Loading chat history...
          </div>
        ) : Object.entries(groupedMessages).length === 0 ? (
          <div className="flex items-center justify-center py-8 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                  {date}
                </div>
              </div>

              {/* Messages for this date */}
              {dateMessages.map(message => {
                // System messages (user joined/left)
                if (message.type === "system" || message.is_system_message) {
                  return (
                    <div key={message.id} className="flex justify-center mb-3">
                      <div className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                        {message.content}
                      </div>
                    </div>
                  );
                }

                // Regular messages
                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id
                        ? "justify-end"
                        : "justify-start"
                    } mb-3`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md ${
                        message.sender_id === user?.id ? "order-2" : "order-1"
                      }`}
                    >
                      {message.sender_id !== user?.id && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {message.sender_name
                                .split(" ")
                                .map(n => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-600">
                              {message.sender_name}
                            </span>
                            {message.sender_id === group.creator_id && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-1 py-0 h-4 bg-amber-100 text-amber-700 border-amber-200 flex items-center"
                                title="Group Creator"
                              >
                                <Crown className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <div
                        className={`px-4 py-2 rounded-lg shadow-sm relative ${
                          message.sender_id === user?.id
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                            : "bg-white border border-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        {message.sender_id === user?.id &&
                          message.sender_id === group.creator_id && (
                            <div className="absolute -top-1 -right-1">
                              <Badge
                                variant="secondary"
                                className="text-xs px-1 py-0 h-4 bg-amber-400 text-amber-900 border-amber-500 flex items-center"
                                title="You are the group creator"
                              >
                                <Crown className="h-3 w-3" />
                              </Badge>
                            </div>
                          )}
                        <p
                          className={`text-sm ${
                            message.isOptimistic ? "opacity-70" : ""
                          }`}
                        >
                          {message.content}
                        </p>

                        {/* Render mentioned files */}
                        {message.mentioned_files &&
                          message.mentioned_files.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.mentioned_files.map((file, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleFileClick(file)}
                                  className={`flex items-center gap-2 w-full p-2 rounded-md transition-all ${
                                    message.sender_id === user?.id
                                      ? "bg-blue-600/50 hover:bg-blue-600/70 text-white"
                                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                                  }`}
                                  aria-label={`Preview file: ${file.name}`}
                                  type="button"
                                >
                                  <span className="text-lg">
                                    {getFileIcon(file.type)}
                                  </span>
                                  <div className="flex-1 text-left min-w-0">
                                    <p className="text-xs font-medium truncate">
                                      {file.name}
                                    </p>
                                    {file.size && (
                                      <p
                                        className={`text-xs ${
                                          message.sender_id === user?.id
                                            ? "text-blue-100"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {(file.size / (1024 * 1024)).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    )}
                                  </div>
                                  <FileText className="h-4 w-4 shrink-0" />
                                </button>
                              ))}
                            </div>
                          )}

                        <p
                          className={`text-xs mt-1 flex items-center gap-1 ${
                            message.sender_id === user?.id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                          {message.isOptimistic && (
                            <span
                              className="inline-block w-2 h-2 bg-current rounded-full animate-pulse"
                              title="Sending..."
                            ></span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t bg-gradient-to-r from-blue-50 to-orange-50 p-4">
        {/* File mentions chips */}
        {mentionedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {mentionedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs border border-blue-200"
              >
                <span>{getFileIcon(file.type)}</span>
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  onClick={() => handleRemoveFileMention(file.id)}
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove file mention: ${file.name}`}
                  type="button"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={sendMessage} className="flex space-x-2">
          <div className="relative flex-1 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFilePicker(!showFilePicker)}
              className="shrink-0 border-2 hover:border-blue-300 hover:bg-blue-50"
              title="Attach file from group"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* File picker dropdown */}
            {showFilePicker && (
              <div className="absolute bottom-full left-0 mb-2 w-80 max-h-64 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2 border-b bg-gray-50">
                  <p className="text-xs font-medium text-gray-700">
                    Select files to mention
                  </p>
                </div>
                {groupFiles.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No files in this group yet
                  </div>
                ) : (
                  <div className="p-1">
                    {groupFiles.map(file => (
                      <button
                        key={file.$id}
                        onClick={() => handleAddFileMention(file)}
                        className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-md text-left transition-colors"
                        disabled={mentionedFiles.find(f => f.id === file.$id)}
                      >
                        <span className="text-lg">
                          {getFileIcon(file.file_type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.file_size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        {mentionedFiles.find(f => f.id === file.$id) && (
                          <Badge variant="secondary" className="text-xs">
                            Added
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Input
              ref={inputRef}
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              disabled={!isConnected}
              className="flex-1 border-2 focus:border-blue-300 bg-white/80 backdrop-blur-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={
              (!newMessage.trim() && mentionedFiles.length === 0) ||
              !isConnected
            }
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* File Preview Modal */}
      {showFilePreview && previewFile && (
        <FilePreviewModal
          file={previewFile}
          isOpen={showFilePreview}
          onClose={() => {
            setShowFilePreview(false);
            setPreviewFile(null);
          }}
        />
      )}
    </div>
  );
};

export default GroupChat;
