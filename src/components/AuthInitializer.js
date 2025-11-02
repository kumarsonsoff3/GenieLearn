"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "../store/authSlice";

/**
 * AuthInitializer component handles authentication state restoration on page refresh
 * This component should be mounted at the root level to ensure authentication
 * state is properly restored when the user refreshes the page
 */
export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    const checkAndRestoreAuth = async () => {
      if (hasCheckedAuth) return;

      try {
        // Check server-side if we have a valid session (works with httpOnly cookies)
        const response = await fetch("/api/auth/status");
        const { hasSession } = await response.json();

        if (hasSession && !user && !loading) {
          setIsRestoring(true);
          try {
            // Try to restore user data from server
            await dispatch(getCurrentUser(true)).unwrap();
          } catch (error) {
            console.error("Session restore failed:", error);
            // The auth slice will handle clearing invalid sessions
          }
          setIsRestoring(false);
        }
      } catch (error) {
        console.error("Auth status check failed:", error);
      }

      setHasCheckedAuth(true);
    };

    checkAndRestoreAuth();
  }, [dispatch, user, loading, hasCheckedAuth]);

  // Show brief loading state only when we're actively restoring a session
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Restoring session...</p>
        </div>
      </div>
    );
  }

  return children;
}
