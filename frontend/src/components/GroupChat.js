'use client'

import React, { useState, useEffect, useRef } from "react";
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
import { Send, ArrowLeft, Users, Crown } from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const WS_URL = `${BACKEND_URL.replace("http://", "ws://").replace(
  "https://",
  "wss://"
)}`;
const API = `${BACKEND_URL}/api`;

const GroupChat = ({ group, onBack }) => {
  const { token, user } = useSelector(state => state.auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const connectWebSocketRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load message history when component mounts
  useEffect(() => {
    loadMessageHistory();
  }, [group.id]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!group.id || !token) return;

    let currentWs = null;
    let reconnectTimeout = null;

    const connectWebSocket = () => {
      // Clear any existing connection
      if (currentWs) {
        currentWs.close();
      }

      const websocket = new WebSocket(
        `${WS_URL}/api/ws/${group.id}?token=${token}`
      );
      currentWs = websocket;

      websocket.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setWs(websocket);
      };

      websocket.onmessage = event => {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);

        if (data.type === "message") {
          const newMsg = {
            id: data.id,
            content: data.content,
            sender_id: data.sender_id,
            sender_name: data.sender_name,
            timestamp: new Date(data.timestamp),
          };
          setMessages(prev => [...prev, newMsg]);
        } else if (data.type === "system") {
          // Handle system messages (user joined/left)
          const systemMsg = {
            id: `system-${Date.now()}-${Math.random()}`,
            content: data.content,
            sender_id: "system",
            sender_name: "System",
            timestamp: new Date(data.timestamp),
            type: "system",
          };
          setMessages(prev => [...prev, systemMsg]);
        }
      };

      websocket.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        setWs(null);
        // Disable auto-reconnection to prevent duplicate connections
        // reconnectTimeout = setTimeout(connectWebSocket, 3000);
      };

      websocket.onerror = error => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };
    };

    connectWebSocket();
    connectWebSocketRef.current = connectWebSocket;

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (currentWs) {
        currentWs.close();
      }
    };
  }, [group.id, token]);

  const handleReconnect = () => {
    if (connectWebSocketRef.current) {
      connectWebSocketRef.current();
    }
  };

  const loadMessageHistory = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(`${API}/groups/${group.id}/messages`, {
        headers,
      });
      const formattedMessages = response.data.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading message history:", error);
    }
  };

  const sendMessage = e => {
    e.preventDefault();
    if (!newMessage.trim() || !ws || !isConnected) return;

    const messageData = {
      type: "message",
      content: newMessage.trim(),
    };

    ws.send(JSON.stringify(messageData));
    setNewMessage("");
    inputRef.current?.focus();
  };

  const formatTime = timestamp => {
    return timestamp.toLocaleTimeString([], {
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
      {/* Chat Header */}
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

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
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
              if (message.type === "system") {
                return (
                  <div key={message.id} className="flex justify-center mb-3">
                    <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
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
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_id === user?.id
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="border-t bg-gradient-to-r from-blue-50 to-orange-50 p-4">
        <form onSubmit={sendMessage} className="flex space-x-3">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 border-2 focus:border-blue-300 bg-white/80 backdrop-blur-sm"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;
