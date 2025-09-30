import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Layout from "../components/Layout";
import { getCurrentUser } from "../store/authSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Separator } from "../components/ui/separator";
import {
  User,
  Edit,
  Plus,
  X,
  Save,
  CheckCircle,
  Mail,
  Calendar,
  BookOpen,
  Star,
} from "lucide-react";
import api from "../utils/axios";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    subjects_of_interest: [],
  });

  const [newSubject, setNewSubject] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        subjects_of_interest: user.subjects_of_interest || [],
      });
    }
  }, [user]);

  const handleAddSubject = () => {
    if (
      newSubject.trim() &&
      !formData.subjects_of_interest.includes(newSubject.trim())
    ) {
      setFormData({
        ...formData,
        subjects_of_interest: [
          ...formData.subjects_of_interest,
          newSubject.trim(),
        ],
      });
      setNewSubject("");
    }
  };

  const handleRemoveSubject = subjectToRemove => {
    setFormData({
      ...formData,
      subjects_of_interest: formData.subjects_of_interest.filter(
        subject => subject !== subjectToRemove
      ),
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await api.put("/auth/profile", formData);

      // Refresh user data
      dispatch(getCurrentUser());
      setEditing(false);
      setSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.response?.data?.detail || "Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      subjects_of_interest: user?.subjects_of_interest || [],
    });
    setEditing(false);
    setError("");
    setNewSubject("");
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-lg">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24 border-4 border-white/20 shadow-xl">
                  <AvatarFallback className="text-3xl font-bold bg-white/20 text-white">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-indigo-100">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {new Date().getFullYear()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {user.subjects_of_interest?.length || 0} subjects
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {!editing && (
                <div className="hidden lg:block">
                  <Button
                    onClick={() => setEditing(true)}
                    className="bg-white/20 text-white border border-white/30 hover:bg-white/30"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Edit Button */}
            {!editing && (
              <div className="lg:hidden mt-4">
                <Button
                  onClick={() => setEditing(true)}
                  className="bg-white/20 text-white border border-white/30 hover:bg-white/30"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        {/* Alert Messages */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold text-gray-700"
                      >
                        Full Name
                      </Label>
                      {editing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={e =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Enter your full name"
                          required
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-lg font-medium mt-1 p-3 bg-gray-50 rounded-md">
                          {user.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700">
                        Email Address
                      </Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md flex items-center justify-between">
                        <span className="text-lg">{user.email}</span>
                        <Badge variant="secondary">Verified</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Email cannot be changed for security reasons
                      </p>
                    </div>
                  </div>

                  {editing && (
                    <>
                      <Separator />
                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Subjects of Interest Card */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <span>Subjects of Interest</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.subjects_of_interest.length > 0 ? (
                      formData.subjects_of_interest.map((subject, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm py-2 px-3 bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                        >
                          <BookOpen className="h-3 w-3 mr-1" />
                          <span>{subject}</span>
                          {editing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSubject(subject)}
                              className="ml-2 hover:text-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-lg">No subjects added yet</p>
                        <p className="text-sm">
                          Add subjects to help us recommend relevant groups
                        </p>
                      </div>
                    )}
                  </div>

                  {editing && (
                    <div className="space-y-3">
                      <Separator />
                      <div className="flex space-x-2">
                        <Input
                          value={newSubject}
                          onChange={e => setNewSubject(e.target.value)}
                          placeholder="Add a subject (e.g., Mathematics, Physics, Computer Science)"
                          onKeyPress={e =>
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddSubject())
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleAddSubject}
                          variant="outline"
                          className="border-purple-300 text-purple-600 hover:bg-purple-50"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  {!editing && formData.subjects_of_interest.length === 0 && (
                    <Button
                      onClick={() => setEditing(true)}
                      variant="outline"
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Subject
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Statistics */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span>Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Groups Joined</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Messages Sent</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">0</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium">Subjects</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">
                      {formData.subjects_of_interest.length}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Statistics update as you engage with the platform
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gray-50 rounded-t-lg">
                <CardTitle className="text-sm font-semibold">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Groups
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <User className="h-4 w-4 mr-2" />
                  Find Friends
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
