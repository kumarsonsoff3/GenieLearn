import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { User, BookOpen, Save, Plus, X } from "lucide-react";

const ProfileForm = ({
  user,
  editing,
  formData,
  updateField,
  newSubject,
  setNewSubject,
  loading,
  onSubmit,
  onCancel,
  onAddSubject,
  onRemoveSubject,
  onEditClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-6">
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
                    onChange={e => updateField("name", e.target.value)}
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
                    onClick={onCancel}
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
                        onClick={() => onRemoveSubject(subject)}
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
                      e.key === "Enter" && (e.preventDefault(), onAddSubject())
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={onAddSubject}
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
                onClick={onEditClick}
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
  );
};

export default ProfileForm;
