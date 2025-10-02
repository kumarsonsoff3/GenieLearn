"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "../store/authSlice";

/**
 * Custom hook to handle authentication state and user data fetching
 * This hook ensures user data is available when the user is authenticated
 */
export const useAuthState = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector(
    state => state.auth
  );

  useEffect(() => {
    // If authenticated but no user data, fetch it
    if (isAuthenticated && !user && !loading) {
      dispatch(getCurrentUser());
    }
  }, [isAuthenticated, user, loading, dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    // Convenience method to force refresh user data
    refreshUser: () => dispatch(getCurrentUser(true)),
  };
};

export default useAuthState;
