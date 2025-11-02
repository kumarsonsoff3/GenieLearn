import { useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import useApi from "./useApi";

/**
 * Custom hook for fetching and managing user statistics
 * @returns {object} Statistics state and methods
 */
const useStats = () => {
  const { user } = useSelector(state => state.auth);
  const { get, loading, error } = useApi();
  const [stats, setStats] = useState({
    groupsJoined: 0,
    messagesSent: 0,
    totalStudyMinutes: 0,
  });
  const [lastFetch, setLastFetch] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch user statistics
  const fetchStats = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      setIsRefreshing(true);

      // Fetch groups, messages, and profile in parallel
      const [groupsData, messagesData, profileData] = await Promise.all([
        get("groups/my-groups"),
        get("users/me/messages/stats"),
        get("auth/profile"),
      ]);

      const newStats = {
        groupsJoined: Array.isArray(groupsData) ? groupsData.length : 0,
        messagesSent:
          messagesData?.messagesSent || messagesData?.total_messages || 0,
        totalStudyMinutes: profileData?.totalStudyMinutes || 0,
      };

      setStats(newStats);
      setLastFetch(new Date());
    } catch (error) {
      console.error("Error fetching user stats:", error);
      // Keep existing stats on error, don't reset to 0
      if (!lastFetch) {
        setStats({
          groupsJoined: 0,
          messagesSent: 0,
          totalStudyMinutes: 0,
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, get, lastFetch]);

  // Auto-fetch stats when user is available
  useEffect(() => {
    if (user?.id && !lastFetch) {
      fetchStats();
    }
  }, [user?.id, lastFetch, fetchStats]);

  // Manual refresh with feedback
  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Check if stats are stale (older than 5 minutes)
  const isStale = useCallback(() => {
    if (!lastFetch) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastFetch < fiveMinutesAgo;
  }, [lastFetch]);

  // Get formatted last update time
  const getLastUpdateText = useCallback(() => {
    if (!lastFetch) return "Never updated";

    const now = new Date();
    const diffMs = now - lastFetch;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just updated";
    if (diffMins < 60) return `Updated ${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Updated ${diffHours}h ago`;

    return lastFetch.toLocaleDateString();
  }, [lastFetch]);

  // Increment message count (for optimistic updates)
  const incrementMessageCount = useCallback(() => {
    setStats(prev => ({
      ...prev,
      messagesSent: prev.messagesSent + 1,
    }));
  }, []);

  // Increment groups joined count (for optimistic updates)
  const incrementGroupsJoined = useCallback(() => {
    setStats(prev => ({
      ...prev,
      groupsJoined: prev.groupsJoined + 1,
    }));
  }, []);

  return {
    // State
    stats,
    loading: loading || isRefreshing,
    error,
    lastFetch,

    // Computed properties
    isStale: isStale(),
    lastUpdateText: getLastUpdateText(),

    // Methods
    fetchStats,
    refreshStats,
    incrementMessageCount,
    incrementGroupsJoined,
  };
};

export default useStats;
