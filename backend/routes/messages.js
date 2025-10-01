const express = require("express");
const Message = require("../models/Message");
const Group = require("../models/Group");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get user's message count across all groups
// DEPRECATED: Use /api/users/me/messages/stats instead
router.get("/user/stats", authenticateToken, async (req, res) => {
  try {
    // Add deprecation warning header
    res.set(
      "X-Deprecated",
      "This endpoint is deprecated. Use /api/users/me/messages/stats instead."
    );

    const user = await User.findOne({ email: req.user.sub });

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

module.exports = router;
