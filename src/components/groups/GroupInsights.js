"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageCircle,
  FileText,
  Activity,
  Calendar,
  Clock,
  Award,
  Zap,
} from "lucide-react";
import api from "../../utils/enhancedApi";
import { useToast } from "../ToastProvider";

const GroupInsights = ({ group }) => {
  const { showError } = useToast();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysActive, setDaysActive] = useState(0);

  // Calculate days active on client side only to avoid hydration mismatch
  useEffect(() => {
    if (group.created_at) {
      const days = Math.floor(
        (new Date() - new Date(group.created_at)) / (1000 * 60 * 60 * 24),
      );
      setDaysActive(days || 0);
    }
  }, [group.created_at]);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/${group.id}/insights`);
      setInsights(response.data || {});
    } catch (error) {
      console.error("Error fetching insights:", error);
      // Use fallback data if API fails
      setInsights({
        totalMessages: 0,
        totalFiles: 0,
        totalMembers: group.member_count || 0,
        messagesThisWeek: 0,
        filesThisWeek: 0,
        newMembersThisWeek: 0,
        mostActiveDay: "N/A",
        averageMessagesPerDay: 0,
        topContributors: [],
        activityTrend: "stable",
      });
    } finally {
      setLoading(false);
    }
  }, [group.id, group.member_count]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const formatDate = dateString => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTrendIcon = trend => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "decreasing":
        return (
          <TrendingUp className="h-5 w-5 text-red-600 transform rotate-180" />
        );
      default:
        return <Activity className="h-5 w-5 text-blue-600" />;
    }
  };

  const getActivityLevel = avgMessages => {
    if (avgMessages >= 50)
      return { label: "Very Active", color: "text-green-600" };
    if (avgMessages >= 20) return { label: "Active", color: "text-blue-600" };
    if (avgMessages >= 5)
      return { label: "Moderate", color: "text-yellow-600" };
    return { label: "Low Activity", color: "text-gray-600" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const activityLevel = getActivityLevel(insights?.averageMessagesPerDay || 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <MessageCircle className="h-5 w-5 text-gray-600" />
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-700"
              >
                {insights?.messagesThisWeek || 0} this week
              </Badge>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">
              {insights?.totalMessages || 0}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Total Messages</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <FileText className="h-5 w-5 text-gray-600" />
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-700"
              >
                {insights?.filesThisWeek || 0} this week
              </Badge>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">
              {insights?.totalFiles || 0}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Files Shared</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Users className="h-5 w-5 text-gray-600" />
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-700"
              >
                {insights?.newMembersThisWeek || 0} this week
              </Badge>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">
              {insights?.totalMembers || 0}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Total Members</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Activity className="h-5 w-5 text-gray-600" />
              {getTrendIcon(insights?.activityTrend)}
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">
              {activityLevel.label}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Group Activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Clock className="h-4 w-4 text-gray-600" />
              Activity Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">Avg. Messages/Day</span>
              <span className="text-base font-semibold text-gray-900">
                {insights?.averageMessagesPerDay?.toFixed(1) || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">Most Active Day</span>
              <span className="text-base font-semibold text-gray-900">
                {insights?.mostActiveDay || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">Group Created</span>
              <span
                className="text-base font-semibold text-gray-900"
                suppressHydrationWarning
              >
                {formatDate(group.created_at)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">Days Active</span>
              <span className="text-base font-semibold text-gray-900">
                {daysActive}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="border-b border-gray-200 pb-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Award className="h-4 w-4 text-gray-600" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {insights?.topContributors &&
            insights.topContributors.length > 0 ? (
              <div className="space-y-2">
                {insights.topContributors
                  .slice(0, 5)
                  .map((contributor, index) => (
                    <div
                      key={contributor.userId || index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gray-900 text-white text-xs font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {contributor.name || "Unknown"}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-700"
                      >
                        {contributor.messageCount || 0} messages
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Award className="h-12 w-12 mb-2 text-gray-300" />
                <p className="text-sm">No contributor data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth Trend */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <BarChart3 className="h-4 w-4 text-gray-600" />
            Growth & Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-xl font-semibold text-gray-900">
                {insights?.engagementRate || "0%"}
              </p>
              <p className="text-xs text-gray-600 mt-1">Engagement Rate</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <Activity className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-xl font-semibold text-gray-900">
                {insights?.activeMembers || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Active Members</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p className="text-xl font-semibold text-gray-900">
                {insights?.activeDays || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Active Days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupInsights;
