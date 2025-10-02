"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { getCurrentUser } from "../store/authSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import Layout from "../components/Layout";
import { CreateGroupModal } from "../components/shared";
import {
  Users,
  Settings,
  MessageCircle,
  Calendar,
  FileText,
  User,
  BookOpen,
  TrendingUp,
  Star,
  Clock,
  Target,
  Award,
  Activity,
  Plus,
  ArrowRight,
  Zap,
  Brain,
  UserPlus,
} from "lucide-react";
import api from "../utils/enhancedApi";
import useStats from "../hooks/useStats";

const Dashboard = React.memo(() => {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated, isInitializing } = useSelector(
    state => state.auth
  );
  const { stats: userStats, loading: statsLoading, refreshStats, isStale } = useStats();
  
  const [additionalStats, setAdditionalStats] = useState({
    learningHours: 0,
    tasksCompleted: 0,
  });

  useEffect(() => {
    // Only fetch user if authenticated but no user data and not already loading or initializing
    if (isAuthenticated && !user && !loading && !isInitializing) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user, isAuthenticated, loading, isInitializing]);

  // Auto-refresh stats if they are stale
  useEffect(() => {
    if (user?.id && isStale && !statsLoading && !loading && !isInitializing) {
      refreshStats();
    }
  }, [user?.id, isStale, statsLoading, refreshStats, loading, isInitializing]);

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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-lg">Loading your dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20 border-4 border-white/20 shadow-lg">
                <AvatarFallback className="text-2xl font-bold bg-white/20 text-white">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {userName}! 🎯
                </h1>
                <p className="text-xl text-blue-100 mb-3">
                  Continue your GenieLearn journey
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Last active: Today</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>{userSubjectsCount} subjects</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="text-right">
                <div className="text-3xl font-bold">Day 1</div>
                <div className="text-blue-200">Learning Streak</div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/groups" className="block">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:scale-105 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">
                      Groups Joined
                    </p>
                    <p className="text-3xl font-bold text-blue-700">
                      {statsLoading || !user ? "..." : userStats.groupsJoined}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-8 w-8 text-blue-500" />
                    <ArrowRight className="h-4 w-4 text-blue-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-xs text-blue-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>
                    {userStats.groupsJoined === 0
                      ? "Ready to join your first group!"
                      : `Active in ${userStats.groupsJoined} group${
                          userStats.groupsJoined > 1 ? "s" : ""
                        }`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">
                    Messages Sent
                  </p>
                  <p className="text-3xl font-bold text-orange-700">
                    {statsLoading || !user ? "..." : userStats.messagesSent}
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2 flex items-center text-xs text-orange-600">
                <Activity className="h-3 w-3 mr-1" />
                <span>
                  {userStats.messagesSent === 0
                    ? "Start your first conversation"
                    : `Keep the conversation going!`}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">
                    Learning Hours
                  </p>
                  <p className="text-3xl font-bold text-green-700">
                    {additionalStats.learningHours}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
              <div className="mt-2 flex items-center text-xs text-green-600">
                <Star className="h-3 w-3 mr-1" />
                <span>Begin your learning journey</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">
                    Achievements
                  </p>
                  <p className="text-3xl font-bold text-orange-700">
                    {additionalStats.tasksCompleted}
                  </p>
                </div>
                <Award className="h-8 w-8 text-orange-500" />
              </div>
              <div className="mt-2 flex items-center text-xs text-orange-600">
                <Target className="h-3 w-3 mr-1" />
                <span>Unlock your first badge</span>
              </div>
            </CardContent>
          </Card>
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
                    onGroupCreated={() => {
                      // Refresh user stats after group creation
                      // You can add specific logic here if needed
                    }}
                    buttonClassName="w-full h-auto p-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
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
    </Layout>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
