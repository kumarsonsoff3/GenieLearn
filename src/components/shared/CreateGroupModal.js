import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Users, Plus } from "lucide-react";
import api from "../../utils/enhancedApi";

const CreateGroupModal = ({
  trigger,
  onGroupCreated,
  buttonClassName = "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
}) => {
  const { token } = useSelector(state => state.auth);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_public: true,
  });

  const handleCreateGroup = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/groups/create", formData);

      // Success - close modal and reset form
      setOpen(false);
      setFormData({ name: "", description: "", is_public: true });

      // Call the callback if provided (to refresh data in parent component)
      if (onGroupCreated) {
        onGroupCreated(response.data);
      }
    } catch (error) {
      console.error("Error creating group:", error);
      console.error("Error response:", error.response);
      console.error("Error data:", error.response?.data);

      let errorMessage = "Failed to create group. Please try again.";

      if (error.response?.status === 401) {
        errorMessage = "You are not authorized. Please log in again.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response.data?.detail ||
          error.response.data?.message ||
          "Invalid group data.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data) {
        errorMessage =
          error.response.data.detail ||
          error.response.data.message ||
          errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Default trigger if none provided
  const defaultTrigger = (
    <Button className={buttonClassName}>
      <Plus className="h-4 w-4 mr-2" />
      Create Group
    </Button>
  );

  const handleOpenChange = newOpen => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset form state when opening
      setError("");
      setFormData({ name: "", description: "", is_public: true });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Create New Study Group</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateGroup} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <div className="font-medium">Error creating group:</div>
              <div>{error}</div>
            </div>
          )}

          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Group Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter group name"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              placeholder="Describe what this group is about"
              required
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={checked =>
                setFormData({ ...formData, is_public: checked })
              }
            />
            <div>
              <Label htmlFor="is_public" className="font-medium">
                Public Group
              </Label>
              <p className="text-xs text-gray-500">
                Anyone can discover and join this group
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600"
              disabled={
                loading || !formData.name.trim() || !formData.description.trim()
              }
            >
              {loading ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupModal;
