"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // This page is hit after OAuth redirect
    // The API route handles the session creation
    // Just redirect to dashboard after a brief moment
    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 1000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-block w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Completing Authentication
          </h2>
          <p className="text-gray-600">
            Please wait while we finish setting up your account...
          </p>
        </div>
      </div>
    </div>
  );
}
