import { useSelector, useDispatch } from "react-redux";
import { useCallback } from "react";
import { getCurrentUser } from "../store/authSlice";

/**
 * Custom hook for authentication logic and user management
 * @returns {object} Authentication state and methods
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector(state => state.auth);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    return !!(user && token);
  }, [user, token]);

  // Get current user data
  const refreshUser = useCallback(() => {
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token]);

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
    token,
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
    isMemberOfGroup,
  };
};

export default useAuth;
