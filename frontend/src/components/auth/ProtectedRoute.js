'use client'

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../store/authSlice';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, loading, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token but no user data, fetch user info
    if (token && !user && !loading) {
      dispatch(getCurrentUser());
    }
  }, [token, user, loading, dispatch]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;