"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { registerUser, clearError } from "../../store/authSlice";
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

const Register = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    subjects_of_interest: "",
  });

  const [validationError, setValidationError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

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
    // Clear validation errors when user starts typing
    setValidationError("");
    setRegistrationSuccess(false);
    // Clear Redux errors too
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setRegistrationSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }

    // Prepare data for submission
    const submitData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      subjects_of_interest: formData.subjects_of_interest
        ? formData.subjects_of_interest
            .split(",")
            .map(s => s.trim())
            .filter(s => s)
        : [],
    };

    try {
      console.log("Submitting registration data:", {
        ...submitData,
        password: "[HIDDEN]",
      });
      const result = await dispatch(registerUser(submitData));

      console.log("Registration result:", result);

      if (registerUser.fulfilled.match(result)) {
        console.log("Registration successful!");
        setRegistrationSuccess(true);
        // Clear form data
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          subjects_of_interest: "",
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 2000);
      } else if (registerUser.rejected.match(result)) {
        console.log("Registration failed:", result.payload);
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
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
          <p className="text-gray-600 text-lg">Start your GenieLearn journey</p>
        </div>

        <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-600">
              Join GenieLearn platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registrationSuccess && (
              <Alert className="mb-4" variant="default">
                <AlertDescription className="text-green-700">
                  ✅ Account created successfully! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}

            {(error || validationError) && !registrationSuccess && (
              <Alert className="mb-4" variant="destructive">
                <AlertDescription>{error || validationError}</AlertDescription>
              </Alert>
            )}

            {/* OAuth Registration Options */}
            {!registrationSuccess && (
              <div className="mb-6">
                <OAuthButtons />

                <div className="my-6 flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm">
                    or sign up with email
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>

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
                  placeholder="Enter your password (min. 8 characters)"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subjects_of_interest">
                  Subjects of Interest (Optional)
                </Label>
                <Input
                  id="subjects_of_interest"
                  name="subjects_of_interest"
                  type="text"
                  value={formData.subjects_of_interest}
                  onChange={handleChange}
                  placeholder="e.g., Math, Physics, Computer Science"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate multiple subjects with commas
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold py-2.5 transition-all duration-200"
                disabled={loading || registrationSuccess}
              >
                {registrationSuccess ? (
                  <>
                    <span className="mr-2">✅</span>
                    Account Created! Redirecting...
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent hover:from-blue-700 hover:to-orange-600 transition-all duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
