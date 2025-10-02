import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import { getCurrentUser, updateUserProfile } from "../store/authSlice";

/**
 * Custom hook for authentication logic and user management
 * @returns {object} Authentication state and methods
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const {
    user,
    loading,
    error,
    isAuthenticated: authState,
  } = useSelector(state => state.auth);

  // Check if user is authenticated (use the state from authSlice)
  const isAuthenticated = useCallback(() => {
    return authState;
  }, [authState]);

  // Get current user data
  const refreshUser = useCallback(
    (forceRefresh = false) => {
      // For session-based auth, always try to refresh if authenticated
      if (authState) {
        dispatch(getCurrentUser(forceRefresh));
      }
    },
    [dispatch, authState]
  );

  // Update user profile with immediate UI refresh
  const updateProfile = useCallback(
    async profileData => {
      try {
        const result = await dispatch(updateUserProfile(profileData));
        if (updateUserProfile.fulfilled.match(result)) {
          return result.payload;
        } else {
          throw new Error(result.payload || "Profile update failed");
        }
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // Get user initials for avatar
  const getUserInitials = useCallback(() => {
    if (!user || !user.name) return "U";
    return user.name
      .split(" ")
      .map(name => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  // Get user display name
  const getDisplayName = useCallback(() => {
    return user?.name || "User";
  }, [user]);

  // Check if user has specific subjects
  const hasSubjects = useCallback(() => {
    return user?.subjects_of_interest?.length > 0;
  }, [user]);

  // Get user's subject count
  const getSubjectCount = useCallback(() => {
    return user?.subjects_of_interest?.length || 0;
  }, [user]);

  // Check if user is member of a group
  const isMemberOfGroup = useCallback(
    groupId => {
      if (!user || !groupId) return false;
      // This would need to be implemented based on how group membership is stored
      return false;
    },
    [user]
  );

  return {
    // State
    user,
    loading,
    error,

    // Computed properties
    isAuthenticated: isAuthenticated(),
    userInitials: getUserInitials(),
    displayName: getDisplayName(),
    hasSubjects: hasSubjects(),
    subjectCount: getSubjectCount(),

    // Methods
    refreshUser,
    updateProfile,
    isMemberOfGroup,
  };
};

export default useAuth;
