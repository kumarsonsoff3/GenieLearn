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
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200 pb-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-600" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
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
                    className="mt-1 border-gray-300"
                  />
                ) : (
                  <p className="text-sm mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                    {user.name}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 flex items-center justify-between">
                  <span className="text-sm">{user.email}</span>
                  <Badge variant="secondary" className="text-xs bg-gray-100">
                    Verified
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed for security reasons
                </p>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={loading}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Subjects of Interest Card */}
      <Card className="border border-gray-200">
        <CardHeader className="border-b border-gray-200 pb-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-gray-600" />
            <span>Interests</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {formData.subjects_of_interest.length > 0 ? (
                formData.subjects_of_interest.map((subject, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    <span>{subject}</span>
                    {editing && (
                      <button
                        type="button"
                        onClick={() => onRemoveSubject(subject)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No interests added yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Add interests to find relevant groups
                  </p>
                </div>
              )}
            </div>

            {editing && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Input
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    placeholder="Add an interest"
                    onKeyPress={e =>
                      e.key === "Enter" && (e.preventDefault(), onAddSubject())
                    }
                    className="flex-1 border-gray-300"
                  />
                  <Button
                    type="button"
                    onClick={onAddSubject}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {!editing && formData.subjects_of_interest.length === 0 && (
              <Button
                onClick={onEditClick}
                variant="outline"
                size="sm"
                className="w-full border-gray-300 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add interests
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;
