import React from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Edit, Mail, Calendar, BookOpen } from "lucide-react";

const ProfileHeader = ({ user, editing, onEditClick }) => {
  if (!user) return null;

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl p-8 mb-8 overflow-hidden">
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Avatar */}
            <Avatar className="w-24 h-24 border-4 border-white/20">
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <div className="flex flex-col space-y-2 text-white/90">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined{" "}
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Recently"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{user.subjects_of_interest?.length || 0} subjects</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Edit Button */}
          {!editing && (
            <div className="hidden lg:block">
              <Button
                onClick={onEditClick}
                className="bg-white/20 text-white border border-white/30 hover:bg-white/30"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Edit Button */}
        {!editing && (
          <div className="lg:hidden mt-4">
            <Button
              onClick={onEditClick}
              className="bg-white/20 text-white border border-white/30 hover:bg-white/30"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
    </div>
  );
};

export default ProfileHeader;
