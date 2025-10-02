"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  const [hasSession, setHasSession] = useState(null); // null = checking, true/false = result

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/status");
        const { hasSession: sessionExists } = await response.json();
        setHasSession(sessionExists);
      } catch (error) {
        console.log("Session check failed:", error);
        setHasSession(false);
      }
    };

    // Only check if we haven't determined session status yet
    if (hasSession === null) {
      checkSession();
    }
  }, [hasSession]);

  useEffect(() => {
    // Only redirect if we're sure there's no authentication and not loading
    if (!loading && !isAuthenticated && hasSession === false) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, hasSession, router]);

  // Show loading while we're checking authentication or session
  if (loading || hasSession === null || (hasSession && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  // If not authenticated and no session, don't render children (will redirect)
  if (!isAuthenticated && !hasSession) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
