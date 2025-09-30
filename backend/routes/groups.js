const express = require('express');
const Group = require('../models/Group');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create group
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, is_public } = req.body;
    const user = await User.findOne({ email: req.user.sub });

    const group = new Group({
      name,
      description,
      is_public: is_public !== undefined ? is_public : true,
      creator_id: user.id,
      members: [user.id]
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
      created_at: group.created_at
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get public groups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.sub });
    const groups = await Group.find({ is_public: true });

    const groupResponses = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      is_public: group.is_public,
      creator_id: group.creator_id,
      member_count: group.members.length,
      is_member: group.members.includes(user.id),
      created_at: group.created_at
    }));

    res.json(groupResponses);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Get user's groups
router.get('/my-groups', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.sub });
    const groups = await Group.find({ members: user.id });

    const groupResponses = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      is_public: group.is_public,
      creator_id: group.creator_id,
      member_count: group.members.length,
      is_member: true,
      created_at: group.created_at
    }));

    res.json(groupResponses);
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Join group
router.post('/:groupId/join', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.sub });
    const group = await Group.findOne({ id: req.params.groupId });

    if (!group) {
      return res.status(404).json({ detail: 'Group not found' });
    }

    if (group.members.includes(user.id)) {
      return res.status(400).json({ detail: 'Already a member of this group' });
    }

    group.members.push(user.id);
    await group.save();

    res.json({ message: 'Successfully joined the group' });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

// Leave group
router.post('/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.sub });
    const group = await Group.findOne({ id: req.params.groupId });

    if (!group) {
      return res.status(404).json({ detail: 'Group not found' });
    }

    if (!group.members.includes(user.id)) {
      return res.status(400).json({ detail: 'You are not a member of this group' });
    }

    // Prevent creator from leaving if there are other members
    if (group.creator_id === user.id && group.members.length > 1) {
      return res.status(400).json({
        detail: 'Group creator cannot leave while there are other members'
      });
    }

    group.members = group.members.filter(memberId => memberId !== user.id);
    await group.save();

    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ detail: 'Internal server error' });
  }
});

module.exports = router;