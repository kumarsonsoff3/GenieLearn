const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get current user's message statistics
router.get("/me/messages/stats", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.sub });

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    // Count messages sent by this user across all groups
    const messageCount = await Message.countDocuments({ sender_id: user.id });

    res.json({
      messagesSent: messageCount,
    });
  } catch (error) {
    console.error("Get user message stats error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

// Get current user's profile information
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.sub });

    if (!user) {
      return res.status(404).json({ detail: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      subjects_of_interest: user.subjects_of_interest,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ detail: "Internal server error" });
  }
});

module.exports = router;
