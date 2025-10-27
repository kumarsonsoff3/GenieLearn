"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  Users,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  User,
  Search,
  MoreVertical,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import api from "../../utils/enhancedApi";
import { useToast } from "../ToastProvider";

const GroupMembers = ({ group, isCreator, onRefresh }) => {
  const { user } = useSelector(state => state.auth);
  const { showSuccess, showError } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/groups/${group.id}/members`);
      setMembers(response.data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      showError("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [group.id, showError]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRemoveMember = async memberId => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await api.delete(`/groups/${group.id}/members/${memberId}`);
      showSuccess("Member removed successfully");
      fetchMembers();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Error removing member:", error);
      showError("Failed to remove member");
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    try {
      await api.put(`/groups/${group.id}/members/${memberId}`, {
        role: newRole,
      });
      showSuccess("Member role updated successfully");
      fetchMembers();
    } catch (error) {
      console.error("Error updating role:", error);
      showError("Failed to update member role");
    }
  };

  const handleInvite = async e => {
    e.preventDefault();
    try {
      await api.post(`/groups/${group.id}/invite`, {
        email: inviteEmail,
      });
      showSuccess("Invitation sent successfully");
      setInviteDialogOpen(false);
      setInviteEmail("");
    } catch (error) {
      console.error("Error inviting member:", error);
      showError("Failed to send invitation");
    }
  };

  const getRoleIcon = role => {
    switch (role?.toLowerCase()) {
      case "admin":
        return <Shield className="h-4 w-4 text-red-600" />;
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-600" />;
      case "creator":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = role => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "destructive";
      case "moderator":
        return "default";
      case "creator":
        return "secondary";
      default:
        return "outline";
    }
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

  const formatDate = dateString => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredMembers = members.filter(
    member =>
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Group Members</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {members.length} {members.length === 1 ? "member" : "members"}
              </p>
            </div>
            {isCreator && (
              <Dialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Members
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Member to Group</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInviteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                      >
                        Send Invitation
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-600">
              {searchQuery
                ? "No members found matching your search"
                : "No members yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMembers.map(member => {
            const memberRole =
              member.user_id === group.creator_id
                ? "creator"
                : member.role || "member";
            const isCurrentUser = member.user_id === user?.$id;

            return (
              <Card
                key={member.$id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border-2 border-purple-200">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">
                          {member.name || "Unknown User"}
                          {isCurrentUser && " (You)"}
                        </h4>
                        <Badge
                          variant={getRoleBadgeVariant(memberRole)}
                          className="gap-1"
                        >
                          {getRoleIcon(memberRole)}
                          {memberRole}
                        </Badge>
                      </div>
                      {member.email && (
                        <p className="text-sm text-gray-600 truncate flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {formatDate(member.joined_at)}
                      </p>
                    </div>
                    {isCreator &&
                      !isCurrentUser &&
                      memberRole !== "creator" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(member.$id, "moderator")
                              }
                              disabled={memberRole === "moderator"}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Moderator
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(member.$id, "member")
                              }
                              disabled={memberRole === "member"}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Make Member
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.$id)}
                              className="text-red-600"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupMembers;
