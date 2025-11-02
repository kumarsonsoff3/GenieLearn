"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { getCurrentUser } from "../store/authSlice";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import Layout from "../components/Layout";
import { CreateGroupModal } from "../components/shared";
import { StatsCard } from "../components/ui/stats-card";
import { formatStudyTime } from "../lib/utils";
import {
  Users,
  MessageCircle,
  Clock,
  Award,
  Plus,
  Settings,
  UserPlus,
  BookOpen,
  TrendingUp,
  Bell,
  Calendar,
  ArrowRight,
  Activity,
  BarChart3,
  Target,
  Sparkles,
  Zap,
  Star,
  Trophy,
  FileText,
  Brain,
  User,
} from "lucide-react";
import useStats from "../hooks/useStats";

const Dashboard = React.memo(() => {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated, isInitializing } = useSelector(
    state => state.auth
  );
  const {
    stats: userStats,
    loading: statsLoading,
    refreshStats,
    isStale,
  } = useStats();

  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !user && !loading && !isInitializing) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user, isAuthenticated, loading, isInitializing]);

  useEffect(() => {
    if (user?.id && isStale && !statsLoading && !loading && !isInitializing) {
      refreshStats();
    }
  }, [user?.id, isStale, statsLoading, refreshStats, loading, isInitializing]);

  useEffect(() => {
    // Simulate loading time for smooth experience
    const timer = setTimeout(() => {
      setDashboardLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const userInitial = useMemo(
    () => user?.name?.charAt(0).toUpperCase() || "U",
    [user?.name]
  );

  const userName = useMemo(
    () => user?.name?.split(" ")[0] || "Student",
    [user?.name]
  );

  const userSubjectsCount = useMemo(
    () => user?.subjects_of_interest?.length || 0,
    [user?.subjects_of_interest]
  );

  if (loading || isInitializing || dashboardLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="text-lg font-medium text-gray-700">
              Loading your personalized dashboard...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8">
        <div className="space-y-8">
          {/* Modern Hero Section */}
          <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-20 w-20 border-4 border-white/20 shadow-xl">
                    <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h1 className="text-4xl lg:text-5xl font-bold">
                        Welcome back, {userName}!
                      </h1>
                      <Sparkles className="h-8 w-8 text-yellow-300 animate-pulse" />
                    </div>
                    <p className="text-xl text-blue-100 mb-4">
                      Ready to continue your learning journey?
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                        <Clock className="h-4 w-4" />
                        <span>Last active: Today</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                        <Target className="h-4 w-4" />
                        <span>{userSubjectsCount} subjects</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
                        <Trophy className="h-4 w-4" />
                        <span>Learning Streak: 5 days</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <Link href="/focus">
                    <Button
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Focus Mode
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -translate-y-36 translate-x-36 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl translate-y-48 -translate-x-48 animate-pulse delay-1000"></div>
          </section>

          {/* Stats Overview - Using modern StatsCard components */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Groups Joined"
              value={statsLoading ? "..." : userStats.groupsJoined}
              icon={Users}
              color="blue"
              trend={userStats.groupsJoined > 0 ? "up" : "neutral"}
              trendValue={userStats.groupsJoined > 0 ? "+2 this week" : ""}
              description={
                userStats.groupsJoined === 0
                  ? "Ready to join your first group!"
                  : `Active in ${userStats.groupsJoined} group${
                      userStats.groupsJoined > 1 ? "s" : ""
                    }`
              }
              isClickable
              onClick={() => (window.location.href = "/groups")}
              loading={statsLoading}
            />

            <StatsCard
              title="Messages Sent"
              value={statsLoading ? "..." : userStats.messagesSent}
              icon={MessageCircle}
              color="green"
              trend={userStats.messagesSent > 10 ? "up" : "neutral"}
              trendValue={userStats.messagesSent > 10 ? "+15 today" : ""}
              description={
                userStats.messagesSent === 0
                  ? "Start your first conversation"
                  : "Keep engaging with your peers!"
              }
              loading={statsLoading}
            />

            <StatsCard
              title="Study Hours"
              value={
                statsLoading
                  ? "..."
                  : formatStudyTime(userStats.totalStudyMinutes)
              }
              icon={Clock}
              color="purple"
              trend={userStats.totalStudyMinutes > 0 ? "up" : "neutral"}
              trendValue={
                userStats.totalStudyMinutes > 0
                  ? `${userStats.totalStudyMinutes} minutes total`
                  : ""
              }
              description={
                userStats.totalStudyMinutes === 0
                  ? "Start your first focus session!"
                  : "Keep up the great work!"
              }
              loading={statsLoading}
            />

            <StatsCard
              title="Achievements"
              value="7"
              icon={Award}
              color="orange"
              trend="up"
              trendValue="2 new badges"
              description="Unlock more through learning"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Link href="/focus">
                      <Button className="w-full h-auto p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-left justify-start transition-all duration-200 shadow-lg hover:shadow-xl">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Brain className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold">Focus Mode</div>
                            <div className="text-xs text-purple-100">
                              Deep work with timer
                            </div>
                          </div>
                        </div>
                      </Button>
                    </Link>

                    <Link href="/groups">
                      <Button className="w-full h-auto p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-left justify-start transition-all duration-200 shadow-lg hover:shadow-xl">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold">Browse Groups</div>
                            <div className="text-xs text-blue-100">
                              Find your study community
                            </div>
                          </div>
                        </div>
                      </Button>
                    </Link>

                    <CreateGroupModal
                      trigger={
                        <Button className="w-full h-auto p-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-left justify-start transition-all duration-200 shadow-lg hover:shadow-xl">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <Plus className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-semibold">Create Group</div>
                              <div className="text-xs text-orange-100">
                                Start your own community
                              </div>
                            </div>
                          </div>
                        </Button>
                      }
                      onGroupCreated={refreshStats}
                    />

                    <Link href="/profile">
                      <Button
                        variant="outline"
                        className="w-full h-auto p-4 border-2 border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-orange-50 hover:border-blue-300 text-left justify-start transition-all duration-200 shadow-sm hover:shadow-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Settings className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-700">
                              Update Profile
                            </div>
                            <div className="text-xs text-gray-500">
                              Customize your experience
                            </div>
                          </div>
                        </div>
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 border-2 border-orange-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:border-orange-300 text-left justify-start transition-all duration-200 shadow-sm hover:shadow-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <UserPlus className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-700">
                            Invite Friends
                          </div>
                          <div className="text-xs text-gray-500">
                            Share the learning experience
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Available Features */}
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <span>Platform Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Available Features */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <Users className="h-6 w-6 text-green-600" />
                        <div>
                          <div className="font-semibold text-green-800">
                            Study Groups
                          </div>
                          <div className="text-sm text-green-600">
                            Create and join communities
                          </div>
                        </div>
                        <Badge className="ml-auto bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 transition-colors">
                          Live
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Settings className="h-6 w-6 text-blue-600" />
                        <div>
                          <div className="font-semibold text-blue-800">
                            Profile Management
                          </div>
                          <div className="text-sm text-blue-600">
                            Customize your experience
                          </div>
                        </div>
                        <Badge className="ml-auto bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900 transition-colors">
                          Live
                        </Badge>
                      </div>
                    </div>

                    {/* Coming Soon Features */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <MessageCircle className="h-6 w-6 text-gray-400" />
                        <div>
                          <div className="font-semibold text-gray-600">
                            Real-time Chat
                          </div>
                          <div className="text-sm text-gray-500">
                            Group messaging system
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          Week 3
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <FileText className="h-6 w-6 text-gray-400" />
                        <div>
                          <div className="font-semibold text-gray-600">
                            File Sharing
                          </div>
                          <div className="text-sm text-gray-500">
                            Share study materials
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          Week 4
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Brain className="h-6 w-6 text-gray-400" />
                        <div>
                          <div className="font-semibold text-gray-600">
                            AI Features
                          </div>
                          <div className="text-sm text-gray-500">
                            Smart study assistance
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          Week 6
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Summary */}
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <span>Profile Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <Avatar className="h-16 w-16 mx-auto mb-3 border-2 border-gray-200">
                        <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">{user?.name}</h3>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Subjects of Interest
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {user?.subjects_of_interest &&
                        user.subjects_of_interest.length > 0 ? (
                          user.subjects_of_interest.map((subject, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {subject}
                            </Badge>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                              No subjects added
                            </p>
                            <Link href="/profile">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                Add Subjects
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <Link href="/profile" className="block">
                      <Button variant="outline" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No recent activity</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Start by joining a group!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
