const jwt = require('jsonwebtoken');
const url = require('url');
const User = require('../models/User');
const Group = require('../models/Group');
const Message = require('../models/Message');

class ConnectionManager {
  constructor() {
    this.activeConnections = new Map(); // groupId -> array of connections
  }

  async handleConnection(ws, req) {
    try {
      const query = url.parse(req.url, true).query;
      const pathParts = req.url.split('/');
      const groupId = pathParts[pathParts.length - 1].split('?')[0];
      const token = query.token;

      if (!token) {
        ws.close(1008, 'Token required');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const user = await User.findOne({ email: decoded.sub });

      if (!user) {
        ws.close(1008, 'User not found');
        return;
      }

      // Check if user is a member of the group
      const group = await Group.findOne({ id: groupId });
      if (!group || !group.members.includes(user.id)) {
        ws.close(1008, 'Not a member of this group');
        return;
      }

      // Add connection
      await this.connect(ws, groupId, user.id, user.name);

      ws.on('message', async (data) => {
        try {
          const messageData = JSON.parse(data.toString());
          
          if (messageData.type === 'message') {
            // Create and save message
            const message = new Message({
              content: messageData.content,
              group_id: groupId,
              sender_id: user.id,
              sender_name: user.name
            });

            await message.save();

            // Broadcast to all clients in the group
            const broadcastData = {
              type: 'message',
              id: message.id,
              content: message.content,
              sender_id: message.sender_id,
              sender_name: message.sender_name,
              timestamp: message.timestamp.toISOString()
            };

            this.broadcastMessage(groupId, broadcastData);
          }
        } catch (error) {
          console.error('Message handling error:', error);
        }
      });

      ws.on('close', () => {
        this.disconnect(groupId, user.id, user.name);
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  async connect(ws, groupId, userId, userName) {
    if (!this.activeConnections.has(groupId)) {
      this.activeConnections.set(groupId, []);
    }

    const connectionInfo = {
      websocket: ws,
      user_id: userId,
      user_name: userName
    };

    this.activeConnections.get(groupId).push(connectionInfo);

    // Notify other users that someone joined
    this.broadcastSystemMessage(groupId, `${userName} joined the chat`, userId);
  }

  disconnect(groupId, userId, userName) {
    if (this.activeConnections.has(groupId)) {
      const connections = this.activeConnections.get(groupId);
      const filteredConnections = connections.filter(conn => conn.user_id !== userId);
      
      if (filteredConnections.length === 0) {
        this.activeConnections.delete(groupId);
      } else {
        this.activeConnections.set(groupId, filteredConnections);
      }

      // Notify other users that someone left
      this.broadcastSystemMessage(groupId, `${userName} left the chat`, userId);
    }
  }

  broadcastMessage(groupId, messageData) {
    if (this.activeConnections.has(groupId)) {
      const connections = this.activeConnections.get(groupId);
      connections.forEach(connection => {
        try {
          connection.websocket.send(JSON.stringify(messageData));
        } catch (error) {
          console.error('Broadcast error:', error);
        }
      });
    }
  }

  broadcastSystemMessage(groupId, message, excludeUserId = null) {
    if (this.activeConnections.has(groupId)) {
      const systemMessage = {
        type: 'system',
        content: message,
        timestamp: new Date().toISOString()
      };

      const connections = this.activeConnections.get(groupId);
      connections.forEach(connection => {
        if (excludeUserId && connection.user_id === excludeUserId) {
          return;
        }
        try {
          connection.websocket.send(JSON.stringify(systemMessage));
        } catch (error) {
          console.error('System message broadcast error:', error);
        }
      });
    }
  }
}

module.exports = ConnectionManager;