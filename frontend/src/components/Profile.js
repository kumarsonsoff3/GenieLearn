'use client'

import React from "react";
import { useRouter } from "next/navigation";
import Layout from "../components/Layout";
import { Alert, AlertDescription } from "../components/ui/alert";
import { CheckCircle } from "lucide-react";

// Import our custom hooks
import { useAuth, useStats, useProfileForm } from "../hooks";

// Import our extracted components
import ProfileHeader from "./profile/ProfileHeader";
import ProfileStats from "./profile/ProfileStats";
import ProfileForm from "./profile/ProfileForm";
import QuickActions from "./profile/QuickActions";
import { CreateGroupModal } from "./shared";

const Profile = () => {
  const router = useRouter();

  // Custom hooks
  const { user, isAuthenticated } = useAuth();
  const { stats, refreshStats, incrementGroupsJoined } = useStats();
  const profileForm = useProfileForm();

  // Handle group creation success
  const handleGroupCreated = groupData => {
    incrementGroupsJoined(); // Optimistic update
    refreshStats(); // Refresh actual stats
  };

  // Loading state
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-lg">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <ProfileHeader
            user={user}
            editing={profileForm.isEditing}
            onEditClick={profileForm.startEditing}
          />

          {/* Alert Messages */}
          {profileForm.success && (
            <Alert className="border-green-200 bg-green-50 mb-6">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Profile updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {profileForm.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{profileForm.error}</AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Profile Information */}
            <div className="lg:col-span-2">
              <ProfileForm
                user={user}
                editing={profileForm.isEditing}
                formData={profileForm.formData}
                updateField={profileForm.updateField}
                newSubject={profileForm.newSubject}
                setNewSubject={profileForm.setNewSubject}
                loading={profileForm.loading}
                onSubmit={profileForm.submitForm}
                onCancel={profileForm.cancelEditing}
                onAddSubject={profileForm.addSubject}
                onRemoveSubject={profileForm.removeSubject}
                onEditClick={profileForm.startEditing}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Statistics */}
              <ProfileStats
                stats={stats}
                formData={profileForm.formData}
                onRefreshStats={refreshStats}
              />

              {/* Quick Actions */}
              <QuickActions
                navigate={navigate}
                onGroupCreated={handleGroupCreated}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
