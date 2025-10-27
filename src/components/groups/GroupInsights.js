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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="h-8 w-8 text-purple-600" />
              <Badge variant="secondary">
                {insights?.messagesThisWeek || 0} this week
              </Badge>
            </div>
            <h3 className="text-2xl font-bold">
              {insights?.totalMessages || 0}
            </h3>
            <p className="text-sm text-gray-600">Total Messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <Badge variant="secondary">
                {insights?.filesThisWeek || 0} this week
              </Badge>
            </div>
            <h3 className="text-2xl font-bold">{insights?.totalFiles || 0}</h3>
            <p className="text-sm text-gray-600">Files Shared</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-green-600" />
              <Badge variant="secondary">
                {insights?.newMembersThisWeek || 0} this week
              </Badge>
            </div>
            <h3 className="text-2xl font-bold">
              {insights?.totalMembers || 0}
            </h3>
            <p className="text-sm text-gray-600">Total Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-8 w-8 text-yellow-600" />
              {getTrendIcon(insights?.activityTrend)}
            </div>
            <h3 className={`text-2xl font-bold ${activityLevel.color}`}>
              {activityLevel.label}
            </h3>
            <p className="text-sm text-gray-600">Group Activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-gray-700">Avg. Messages/Day</span>
              <span className="text-lg font-semibold text-purple-600">
                {insights?.averageMessagesPerDay?.toFixed(1) || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-700">Most Active Day</span>
              <span className="text-lg font-semibold text-blue-600">
                {insights?.mostActiveDay || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700">Group Created</span>
              <span className="text-lg font-semibold text-green-600">
                {formatDate(group.created_at)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-gray-700">Days Active</span>
              <span className="text-lg font-semibold text-yellow-600">
                {Math.floor(
                  (new Date() - new Date(group.created_at)) /
                    (1000 * 60 * 60 * 24)
                ) || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Contributors
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights?.topContributors &&
            insights.topContributors.length > 0 ? (
              <div className="space-y-3">
                {insights.topContributors
                  .slice(0, 5)
                  .map((contributor, index) => (
                    <div
                      key={contributor.userId || index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                              ? "bg-gray-400"
                              : index === 2
                              ? "bg-orange-600"
                              : "bg-purple-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span className="font-medium">
                          {contributor.name || "Unknown"}
                        </span>
                      </div>
                      <Badge variant="secondary">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Growth & Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-700">
                {insights?.engagementRate || "0%"}
              </p>
              <p className="text-sm text-gray-600">Engagement Rate</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-700">
                {insights?.activeMembers || 0}
              </p>
              <p className="text-sm text-gray-600">Active Members</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-700">
                {insights?.activeDays || 0}
              </p>
              <p className="text-sm text-gray-600">Active Days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupInsights;
