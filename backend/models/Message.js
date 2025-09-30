const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  group_id: {
    type: String,
    required: true
  },
  sender_id: {
    type: String,
    required: true
  },
  sender_name: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);