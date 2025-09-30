const express = require('express');
const Message = require('../models/Message');
const Group = require('../models/Group');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get group messages
router.get('/:groupId/messages', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const user = await User.findOne({ email: req.user.sub });
    const group = await Group.findOne({ id: groupId });

    if (!group) {
      return res.status(404).json({ detail: 'Group not found' });
    }

    if (!group.members.includes(user.id)) {
      return res.status(403).json({ detail: 'Not a member of this group' });
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
      timestamp: message.timestamp
    }));

    res.json(messageResponses);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;