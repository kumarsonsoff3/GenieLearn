"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser, clearError } from "../../store/authSlice";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Loader2 } from "lucide-react";
import OAuthButtons from "./OAuthButtons";

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [oauthError, setOauthError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Check if user was redirected from registration or OAuth errors
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("registered") === "true") {
      setShowRegistrationSuccess(true);
    }

    // Handle OAuth errors
    const oauthErrorParam = urlParams.get("error");
    if (oauthErrorParam) {
      const errorMessages = {
        missing_oauth_params:
          "OAuth authentication failed. This usually means the OAuth provider (Google/GitHub) is not properly configured in Appwrite Console.",
        oauth_failed:
          "OAuth authentication was cancelled or failed. Please try again.",
        oauth_session_failed:
          "Failed to create session after OAuth authentication.",
        oauth_callback_error:
          "An error occurred during OAuth callback processing.",
      };

      setOauthError(
        errorMessages[oauthErrorParam] ||
          "OAuth authentication failed. Please try again."
      );
    }

    // Clear URL parameters
    if (urlParams.get("registered") || urlParams.get("error")) {
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <Image
              src="/logo.png"
              alt="GenieLearn Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
              GenieLearn
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Welcome back to your learning journey
          </p>
        </div>

        <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Sign In
            </CardTitle>
            <CardDescription className="text-gray-600">
              Access your GenieLearn platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showRegistrationSuccess && (
              <Alert className="mb-4" variant="default">
                <AlertDescription className="text-green-700">
                  🎉 Account created successfully! Please login with your
                  credentials.
                </AlertDescription>
              </Alert>
            )}

            {oauthError && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>
                  <strong>OAuth Error:</strong> {oauthError}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* OAuth Login Options */}
            <div className="mb-6">
              <OAuthButtons />

              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">
                  or
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold py-2.5 transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent hover:from-blue-700 hover:to-orange-600 transition-all duration-200"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
