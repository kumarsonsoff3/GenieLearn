"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Layout from "./Layout";
import GroupCard from "./groups/GroupCard";
import CreateGroupModal from "./shared/CreateGroupModal";
import { LoadingSpinner } from "./ui/loading-spinner";
import { ErrorMessage } from "./ui/error-message";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Search, Users, Globe, RefreshCw } from "lucide-react";
import api from "../utils/enhancedApi";
import { useToast } from "./ToastProvider";
import { Button } from "./ui/button";

const GroupsView = () => {
  const { user } = useSelector(state => state.auth);
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [publicGroups, setPublicGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("my-groups");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [publicResponse, myGroupsResponse] = await Promise.all([
        api.get("/groups/list", { skipCache: true }),
        api.get("/groups/my-groups", { skipCache: true }),
      ]);

      setPublicGroups(publicResponse.data || []);
      setMyGroups(myGroupsResponse.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Failed to load groups. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchGroups();
      showSuccess("Groups refreshed!");
    } catch (error) {
      console.error("Error refreshing groups:", error);
      showError("Failed to refresh groups");
    } finally {
      setRefreshing(false);
    }
  }, [fetchGroups, showSuccess, showError]);

  const handleJoinGroup = useCallback(
    async groupId => {
      try {
        await api.post(`/groups/${groupId}/join`);
        showSuccess("Successfully joined the group!");
        fetchGroups();
      } catch (error) {
        console.error("Error joining group:", error);
        showError("Failed to join group. Please try again.");
      }
    },
    [fetchGroups, showSuccess, showError]
  );

  const handleLeaveGroup = useCallback(
    async groupId => {
      if (!confirm("Are you sure you want to leave this group?")) return;

      try {
        await api.post(`/groups/${groupId}/leave`);
        showSuccess("Successfully left the group!");
        fetchGroups();
      } catch (error) {
        console.error("Error leaving group:", error);
        const errorMessage =
          error.response?.data?.detail ||
          "Failed to leave group. Please try again.";
        showError(errorMessage);
      }
    },
    [fetchGroups, showSuccess, showError]
  );

  const handleOpenGroup = useCallback(
    groupId => {
      router.push(`/groups/${groupId}`);
    },
    [router]
  );

  const handleGroupCreated = useCallback(
    newGroup => {
      showSuccess("Group created successfully!");
      fetchGroups();
    },
    [fetchGroups, showSuccess]
  );

  const filterGroups = useCallback(
    groups => {
      if (!searchQuery.trim()) return groups;
      return groups.filter(
        group =>
          group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
    [searchQuery]
  );

  const filteredMyGroups = filterGroups(myGroups);

  // Filter out groups that user has already joined from public groups
  const filteredPublicGroups = filterGroups(
    publicGroups.filter(pg => {
      // Use the is_member field from API or fallback to checking myGroups
      if (pg.is_member !== undefined) {
        return !pg.is_member;
      }
      // Fallback: Check if user is a member using various possible ID fields
      const isMember = myGroups.some(
        mg => mg.id === pg.id || mg.$id === pg.$id || mg._id === pg._id
      );
      return !isMember;
    })
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <ErrorMessage message={error} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Study Groups
            </h1>
            <p className="text-gray-600 mt-2">
              Collaborate and learn together with your peers
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <CreateGroupModal onGroupCreated={handleGroupCreated} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my-groups" className="gap-2">
              <Users className="h-4 w-4" />
              My Groups ({myGroups.length})
            </TabsTrigger>
            <TabsTrigger value="discover" className="gap-2">
              <Globe className="h-4 w-4" />
              Discover ({filteredPublicGroups.length})
            </TabsTrigger>
          </TabsList>

          {/* My Groups Tab */}
          <TabsContent value="my-groups">
            {filteredMyGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {searchQuery
                    ? "No groups found matching your search"
                    : "You haven't joined any groups yet"}
                </p>
                {!searchQuery && (
                  <CreateGroupModal
                    onGroupCreated={handleGroupCreated}
                    buttonClassName="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMyGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isExpanded={false}
                    onToggle={() => handleOpenGroup(group.id)}
                    isMember={true}
                    onLeave={() => handleLeaveGroup(group.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover">
            {filteredPublicGroups.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchQuery
                    ? "No public groups found matching your search"
                    : "No public groups available"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPublicGroups.map(group => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isExpanded={false}
                    onToggle={() => handleOpenGroup(group.id)}
                    isMember={false}
                    onJoin={() => handleJoinGroup(group.id)}
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

export default GroupsView;
