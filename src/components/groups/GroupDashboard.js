"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  MessageCircle,
  FileText,
  Users,
  BarChart3,
  ArrowLeft,
  Settings,
  Crown,
  X,
  Code2,
  Star,
  GitFork,
  Brain,
  Globe,
  Lock,
} from "lucide-react";
import GroupChat from "../GroupChat";
import GroupFiles from "./GroupFiles";
import GroupMembers from "./GroupMembers";
import GroupInsights from "./GroupInsights";
import GroupOverview from "./GroupOverview";
import { cn } from "../../lib/utils";

const GroupDashboard = ({ group, onClose, onRefresh }) => {
  const router = useRouter();
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [groupData, setGroupData] = useState(group);
  const [refreshKey, setRefreshKey] = useState(0);
  const isCreator = user && group.creator_id === user.$id;

  useEffect(() => {
    setGroupData(group);
  }, [group]);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  const handleFocusMode = () => {
    router.push("/focus");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Code2 },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "files", label: "Files", icon: FileText },
    { id: "members", label: "Members", icon: Users },
    { id: "insights", label: "Insights", icon: BarChart3 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-hidden flex flex-col">
      {/* GitHub-Style Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto">
          {/* Top Bar */}
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-gray-100 -ml-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  {groupData.is_public ? (
                    <Globe className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-600" />
                  )}
                  <h1 className="text-lg font-semibold text-gray-900">
                    {groupData.name}
                  </h1>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs font-normal bg-gray-100 text-gray-700"
                >
                  {groupData.is_public ? "Public" : "Private"}
                </Badge>
                {isCreator && (
                  <Badge
                    variant="secondary"
                    className="text-xs font-normal bg-gray-100 text-gray-700"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Owner
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons - GitHub style */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-gray-300 hover:bg-gray-50"
                onClick={handleFocusMode}
              >
                <Brain className="h-4 w-4" />
                Focus Mode
              </Button>
              {isCreator && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-gray-300 hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* GitHub-Style Tab Navigation */}
          <div className="px-6">
            <nav className="flex gap-1 -mb-px">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                      isActive
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto px-6 py-6">
          {activeTab === "overview" && (
            <GroupOverview
              key={refreshKey}
              group={groupData}
              isCreator={isCreator}
              onNavigateToTab={setActiveTab}
            />
          )}

          {activeTab === "chat" && (
            <div className="bg-white rounded-md border border-gray-200 h-[calc(100vh-200px)]">
              <GroupChat group={groupData} onBack={onClose} embedded={true} />
            </div>
          )}

          {activeTab === "files" && (
            <GroupFiles
              key={refreshKey}
              group={groupData}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === "members" && (
            <GroupMembers
              group={groupData}
              isCreator={isCreator}
              onRefresh={handleRefresh}
            />
          )}

          {activeTab === "insights" && <GroupInsights group={groupData} />}
        </div>
      </div>
    </div>
  );
};

export default GroupDashboard;
