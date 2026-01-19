"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Edit, Mail, Calendar, BookOpen } from "lucide-react";

const ProfileHeader = ({ user, editing, onEditClick }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!user) return null;

  const formatJoinDate = () => {
    if (!user.created_at) return "Recently";
    // Use static format during SSR to avoid hydration mismatch
    return new Date(user.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-2xl font-semibold">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {user.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{user.email}</p>
          </div>
        </div>

        {!editing && (
          <Button
            onClick={onEditClick}
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span suppressHydrationWarning>Joined {formatJoinDate()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-4 w-4" />
          <span>{user.subjects_of_interest?.length || 0} interests</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
