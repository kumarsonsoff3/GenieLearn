'use client'

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Layout from "../components/Layout";
import GroupChat from "../components/GroupChat";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import {
  Users,
  Plus,
  Calendar,
  MessageCircle,
  UserPlus,
  UserMinus,
  Crown,
  Search,
  Filter,
  Star,
  Globe,
  Lock,
  Activity,
  TrendingUp,
  Clock,
  BookOpen,
} from "lucide-react";
import api from "../utils/axios";

const Groups = () => {
  const { user } = useSelector(state => state.auth);
  const [publicGroups, setPublicGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalPublicGroups: 0,
    userJoinedGroups: 0,
    publicGroupsJoined: 0,
    publicGroupsNotJoined: 0,
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_public: true,
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);

      const [publicResponse, myGroupsResponse, statsResponse] =
        await Promise.all([
          api.get('/groups/list'),
          api.get('/groups/my-groups'),
          api.get('/groups/stats'),
        ]);

      // Show ALL public groups (both joined and not joined)
      setPublicGroups(publicResponse.data);
      setMyGroups(myGroupsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async e => {
    e.preventDefault();
    try {
      await api.post('/groups/create', formData);

      setCreateGroupOpen(false);
      setFormData({ name: "", description: "", is_public: true });
      fetchGroups(); // Refresh groups
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const handleJoinGroup = async groupId => {
    try {
      await api.post(`/groups/${groupId}/join`);
      fetchGroups(); // Refresh groups
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const handleLeaveGroup = async groupId => {
    try {
      const response = await api.post(`/groups/${groupId}/leave`);

      // Show success message
      alert(response.data.message || "Left group successfully");

      // Refresh groups after successful leave
      await fetchGroups();
    } catch (error) {
      console.error("Error leaving group:", error);
      if (error.response && error.response.data.detail) {
        // Show user-friendly error message
        alert(error.response.data.detail);
      } else {
        alert("Failed to leave group. Please try again.");
      }
    }
  };

  const GroupCard = ({ group, showJoinButton = false }) => (
    <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 bg-white hover:bg-gray-50 hover:border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-gray-200">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                {group.name?.charAt(0).toUpperCase() || "G"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-bold text-gray-800 line-clamp-1">
                {group.name}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-100 text-blue-800"
                >
                  <Users className="h-3 w-3 mr-1" />
                  {group.member_count} member
                  {group.member_count !== 1 ? "s" : ""}
                </Badge>
                {user && group.creator_id === user.id && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-orange-100 text-orange-700 border-orange-300"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Creator
                  </Badge>
                )}
                {group.is_public ? (
                  <Badge
                    variant="outline"
                    className="text-xs border-green-300 text-green-700"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs border-orange-300 text-orange-700"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {group.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Crown className="h-3 w-3" />
            <span>Created by {group.creator_name || "Unknown"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>
              Created {new Date(group.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Activity className="h-3 w-3" />
            <span>Active</span>
          </div>
        </div>

        <Separator className="mb-4" />

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {showJoinButton && !group.is_member && (
              <Button
                onClick={() => handleJoinGroup(group.id)}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Join
              </Button>
            )}
            {group.is_member && showJoinButton && (
              <Button
                onClick={() => handleLeaveGroup(group.id)}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <UserMinus className="h-3 w-3 mr-1" />
                Leave
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedGroup(group)}
            disabled={!group.is_member}
            className="border-purple-300 text-purple-600 hover:bg-purple-50 disabled:opacity-50"
          >
            <MessageCircle className="h-3 w-3 mr-1" />
            Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-700">
              Loading your groups...
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show chat interface if a group is selected
  if (selectedGroup) {
    return (
      <Layout>
        <Card className="h-[calc(100vh-8rem)] shadow-xl">
          <GroupChat
            group={selectedGroup}
            onBack={() => setSelectedGroup(null)}
          />
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
                  <Users className="h-10 w-10" />
                  <span>Study Groups</span>
                </h1>
                <p className="text-xl text-blue-100 mb-4">
                  Connect, collaborate, and learn together
                </p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{stats.userJoinedGroups} groups joined</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="h-4 w-4" />
                    <span>{stats.totalPublicGroups} public groups</span>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="text-right">
                  <div className="text-3xl font-bold">{stats.totalGroups}</div>
                  <div className="text-blue-200">Total Groups</div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        {/* Action Bar */}
        <Card className="shadow-xl bg-gradient-to-r from-blue-50 to-orange-50 border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
                  <Input
                    placeholder="Search groups..."
                    className="pl-10 w-64 bg-white/80 backdrop-blur-sm border-2 focus:border-blue-300"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/80 hover:bg-white border-blue-200 hover:border-blue-300"
                >
                  <Filter className="h-4 w-4 mr-2 text-blue-600" />
                  Filter
                </Button>
              </div>

              <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <span>Create New Study Group</span>
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateGroup} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Group Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={e =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter group name"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe what this group is about"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Switch
                        id="is_public"
                        checked={formData.is_public}
                        onCheckedChange={checked =>
                          setFormData({ ...formData, is_public: checked })
                        }
                      />
                      <div>
                        <Label htmlFor="is_public" className="font-medium">
                          Public Group
                        </Label>
                        <p className="text-xs text-gray-500">
                          Anyone can discover and join this group
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateGroupOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                      >
                        Create Group
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Groups Content */}
        <Tabs defaultValue="my-groups" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger
              value="my-groups"
              className="text-sm font-medium rounded-md"
            >
              My Groups ({stats.userJoinedGroups})
            </TabsTrigger>
            <TabsTrigger
              value="discover"
              className="text-sm font-medium rounded-md"
            >
              All Public Groups ({stats.totalPublicGroups})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups" className="space-y-6 mt-6">
            {myGroups.length === 0 ? (
              <Card className="shadow-xl">
                <CardContent className="text-center py-12">
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                    <Users className="h-12 w-12 text-blue-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No groups joined yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start your GenieLearn journey by creating your first group
                    or discovering existing ones
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => setCreateGroupOpen(true)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Group
                    </Button>
                    <Button variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Discover Groups
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    showJoinButton={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-6 mt-6">
            {publicGroups.length === 0 ? (
              <Card className="shadow-xl">
                <CardContent className="text-center py-12">
                  <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                    <Globe className="h-12 w-12 text-green-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No public groups available
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Be the pioneer! Create the first public study group and help
                    build our learning community
                  </p>
                  <Button
                    onClick={() => setCreateGroupOpen(true)}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Public Group
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    showJoinButton={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Groups;
