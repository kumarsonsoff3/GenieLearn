"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import {
  Users,
  MessageCircle,
  Calendar,
  Crown,
  Globe,
  Lock,
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
        "border border-gray-200 hover:border-gray-300 transition-colors",
        isExpanded ? "border-gray-400" : "",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="h-10 w-10 rounded bg-gray-900 flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(group.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold truncate text-gray-900">
                  {group.name}
                </h3>
                {group.is_public ? (
                  <Globe className="h-3 w-3 text-gray-500" />
                ) : (
                  <Lock className="h-3 w-3 text-gray-500" />
                )}
                {group.creator_id === group.current_user_id && (
                  <Crown className="h-3 w-3 text-gray-500" />
                )}
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {group.description || "No description available"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{group.member_count || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span suppressHydrationWarning>{formatDate(group.created_at)}</span>
          </div>
          {group.message_count !== undefined && (
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{group.message_count}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isMember ? (
            <>
              <Button
                onClick={onToggle}
                size="sm"
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-sm"
              >
                Open
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLeave}
                className="text-xs text-red-600 hover:bg-red-50 border-gray-300"
              >
                Leave
              </Button>
            </>
          ) : (
            <Button
              onClick={onJoin}
              size="sm"
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-sm"
            >
              Join
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;
