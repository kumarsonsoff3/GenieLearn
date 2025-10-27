"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ProtectedRoute from "../../../src/components/auth/ProtectedRoute";
import GroupDashboard from "../../../src/components/groups/GroupDashboard";
import { LoadingSpinner } from "../../../src/components/ui/loading-spinner";
import { ErrorMessage } from "../../../src/components/ui/error-message";
import api from "../../../src/utils/enhancedApi";

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSelector(state => state.auth);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const groupId = params.groupId;

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch group details
        const response = await api.get(`/groups/${groupId}`);
        setGroup(response.data);
      } catch (error) {
        console.error("Error fetching group:", error);
        setError(error.response?.data?.error || "Failed to load group details");
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  const handleClose = () => {
    router.push("/groups");
  };

  const handleRefresh = async () => {
    try {
      const response = await api.get(`/groups/${groupId}`);
      setGroup(response.data);
    } catch (error) {
      console.error("Error refreshing group:", error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !group) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <ErrorMessage message={error || "Group not found"} />
            <button
              onClick={handleClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Groups
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <GroupDashboard
        group={group}
        onClose={handleClose}
        onRefresh={handleRefresh}
      />
    </ProtectedRoute>
  );
}
