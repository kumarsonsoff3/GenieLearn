"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Users,
  MessageCircle,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  Crown,
  Globe,
  Lock,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../lib/utils";

const GroupCard = ({
  group,
  isExpanded,
  onToggle,
  isMember,
  onJoin,
  onLeave,
}) => {
  const formatDate = dateString => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = name => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-lg",
        isExpanded ? "ring-2 ring-purple-500" : ""
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="h-12 w-12 border-2 border-purple-200">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-semibold">
                {getInitials(group.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold truncate">{group.name}</h3>
                {group.is_public ? (
                  <Globe className="h-4 w-4 text-green-600" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-600" />
                )}
                {group.creator_id === group.current_user_id && (
                  <Crown className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">
                {group.description || "No description available"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="ml-2">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{group.member_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(group.created_at)}</span>
          </div>
          {group.message_count !== undefined && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{group.message_count}</span>
            </div>
          )}
          {group.file_count !== undefined && (
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{group.file_count}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isMember ? (
            <>
              <Button
                onClick={onToggle}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isExpanded ? "Close Dashboard" : "Open Dashboard"}
              </Button>
              {!isExpanded && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLeave}
                  className="text-red-600 hover:bg-red-50"
                >
                  Leave
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={onJoin}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Users className="h-4 w-4 mr-2" />
              Join Group
            </Button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">Activity</p>
                  <p className="text-sm font-semibold">
                    {group.recent_activity || "Low"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Status</p>
                  <p className="text-sm font-semibold">
                    {group.status || "Active"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupCard;
