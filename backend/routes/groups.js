const express = require("express");
const Group = require("../models/Group");
const User = require("../models/User");
const Message = require("../models/Message");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Utility function to clean up empty groups
const cleanupEmptyGroups = async () => {
  try {
    const result = await Group.deleteMany({
      $expr: { $eq: [{ $size: "$members" }, 0] },
    });
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} empty groups`);
    }
    return result.deletedCount;
  } catch (error) {
    console.error("Error cleaning up empty groups:", error);
    return 0;
  }
};

// Create group
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description, is_public } = req.body;

    // Input validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ detail: "Group name is required" });
    }
    if (name.trim().length > 100) {
      return res
        .status(400)
        .json({ detail: "Group name must be less than 100 characters" });
    }
    if (description && typeof description !== "string") {
      return res.status(400).json({ detail: "Description must be a string" });
    }
    if (description && description.length > 500) {
      return res
        .status(400)
        .json({ detail: "Description must be less than 500 characters" });
    }
    if (is_public !== undefined && typeof is_public !== "boolean") {
      return res.status(400).json({ detail: "is_public must be a boolean" });
    }

    const user = await User.findOne({ email: req.user.sub });

    const group = new Group({
      name: name.trim(),
      description: description ? description.trim() : "",
      is_public: is_public !== undefined ? is_public : true,
      creator_id: user.id,
      members: [user.id],
    });

    await group.save();

    res.json({
      id: group.id,
      name: group.name,
      description: group.description,
      is_public: group.is_public,
      creator_id: group.creator_id,
      member_count: 1,
      is_member: true,
      created_at: group.created_at,
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Get public groups
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.sub });

    // Clean up any empty groups first
    await cleanupEmptyGroups();

    // Get ALL public groups that have at least one member
    const groups = await Group.find({
      is_public: true,
      $expr: { $gt: [{ $size: "$members" }, 0] },
    });

    const groupResponses = await Promise.all(
      groups.map(async group => {
        const creator = await User.findOne({ id: group.creator_id });
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          is_public: group.is_public,
          creator_id: group.creator_id,
          creator_name: creator ? creator.name : "Unknown",
          member_count: group.members.length,
          is_member: group.members.includes(user.id),
          created_at: group.created_at,
        };
      })
    );

    res.json(groupResponses);
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Get user's groups
router.get("/my-groups", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.sub });

    // Clean up any empty groups first
    await cleanupEmptyGroups();

    const groups = await Group.find({ members: user.id });

    const groupResponses = await Promise.all(
      groups.map(async group => {
        const creator = await User.findOne({ id: group.creator_id });
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          is_public: group.is_public,
          creator_id: group.creator_id,
          creator_name: creator ? creator.name : "Unknown",
          member_count: group.members.length,
          is_member: true,
          created_at: group.created_at,
        };
      })
    );

    res.json(groupResponses);
  } catch (error) {
    console.error("Get user groups error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Join group
router.post("/:groupId/join", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.sub });
    const group = await Group.findOne({ id: req.params.groupId });

    if (!group) {
      return res.status(404).json({ detail: "Group not found" });
    }

    if (group.members.includes(user.id)) {
      return res.status(400).json({ detail: "Already a member of this group" });
    }

    group.members.push(user.id);
    await group.save();

    res.json({ message: "Successfully joined the group" });
  } catch (error) {
    console.error("Join group error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Leave group
router.post("/:groupId/leave", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.sub });
    const group = await Group.findOne({ id: req.params.groupId });

    if (!group) {
      return res.status(404).json({ detail: "Group not found" });
    }

    if (!group.members.includes(user.id)) {
      return res
        .status(400)
        .json({ detail: "You are not a member of this group" });
    }

    // Prevent creator from leaving if there are other members
    if (group.creator_id === user.id && group.members.length > 1) {
      return res.status(400).json({
        detail: "Group creator cannot leave while there are other members",
      });
    }

    group.members = group.members.filter(memberId => memberId !== user.id);

    // Delete the group if no members are left
    if (group.members.length === 0) {
      await Group.deleteOne({ _id: group._id });
      console.log(
        `Group ${group.name} (${group.id}) deleted - no members remaining`
      );
      res.json({
        message:
          "Successfully left the group. Group was deleted as it had no remaining members.",
      });
    } else {
      await group.save();
      res.json({ message: "Successfully left the group" });
    }
  } catch (error) {
    console.error("Leave group error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Get platform statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    // Clean up any empty groups first
    await cleanupEmptyGroups();

    const user = await User.findOne({ email: req.user.sub });

    // Get all groups with at least one member
    const allGroups = await Group.find({
      $expr: { $gt: [{ $size: "$members" }, 0] },
    });

    // Get public groups
    const publicGroups = await Group.find({
      is_public: true,
      $expr: { $gt: [{ $size: "$members" }, 0] },
    });

    // Get user's groups
    const userGroups = await Group.find({
      members: user.id,
      $expr: { $gt: [{ $size: "$members" }, 0] },
    });

    // Calculate stats
    const totalGroups = allGroups.length;
    const totalPublicGroups = publicGroups.length;
    const userJoinedGroups = userGroups.length;
    const publicGroupsJoined = userGroups.filter(
      group => group.is_public
    ).length;
    const publicGroupsNotJoined = totalPublicGroups - publicGroupsJoined;

    res.json({
      totalGroups,
      totalPublicGroups,
      userJoinedGroups,
      publicGroupsJoined,
      publicGroupsNotJoined,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Get group messages
router.get("/:groupId/messages", authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const user = await User.findOne({ email: req.user.sub });
    const group = await Group.findOne({ id: groupId });

    if (!group) {
      return res.status(404).json({ detail: "Group not found" });
    }

    if (!group.members.includes(user.id)) {
      return res.status(403).json({ detail: "Not a member of this group" });
    }

    // Get messages for the group, sorted by timestamp (oldest first)
    const messages = await Message.find({ group_id: groupId })
      .sort({ timestamp: 1 })
      .limit(limit);

    const messageResponses = messages.map(message => ({
      id: message.id,
      content: message.content,
      group_id: message.group_id,
      sender_id: message.sender_id,
      sender_name: message.sender_name,
      timestamp: message.timestamp,
    }));

    res.json(messageResponses);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

module.exports = router;
