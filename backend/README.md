# GenieLearn - Node.js Backend

A real-time learning platform backend built with Node.js, Express, and MongoDB.

## Features

- **Authentication**: JWT-based authentication with secure password hashing
- **Group Management**: Create, join, and manage study groups
- **Real-time Messaging**: WebSocket-based real-time chat functionality
- **RESTful API**: Complete REST API for frontend integration
- **Security**: Rate limiting, CORS protection, and security headers

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Real-time**: WebSocket (ws)
- **Security**: Helmet, CORS, express-rate-limit

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file with:

   ```env
   MONGO_URL=mongodb://localhost:27017/genielearn
   SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
   PORT=8001
   CORS_ORIGINS=http://localhost:3000
   NODE_ENV=development
   ```

3. **Start MongoDB**:

   - Local: `mongod`
   - Or use MongoDB Atlas cloud service

4. **Run the server**:

   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:8001`

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Groups

- `GET /api/groups` - Get all public groups (protected)
- `GET /api/groups/my-groups` - Get user's groups (protected)
- `POST /api/groups` - Create a new group (protected)
- `POST /api/groups/:groupId/join` - Join a group (protected)
- `POST /api/groups/:groupId/leave` - Leave a group (protected)

### Messages

- `GET /api/groups/:groupId/messages` - Get group messages (protected)

### WebSocket

- `ws://localhost:8001/ws/:groupId?token=JWT_TOKEN` - Real-time group chat

## Project Structure

```
backend/
├── models/          # MongoDB models
│   ├── User.js
│   ├── Group.js
│   └── Message.js
├── routes/          # API routes
│   ├── auth.js
│   ├── groups.js
│   └── messages.js
├── middleware/      # Express middleware
│   └── auth.js
├── utils/          # Utility functions
│   └── connectionManager.js
├── server.js       # Main server file
├── package.json
└── README.md
```

## Development

- Use `npm run dev` for development with nodemon auto-restart
- The API supports CORS for frontend development
- Rate limiting is set to 100 requests per 15 minutes per IP
- All routes except root are protected with JWT authentication

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting
- CORS protection
- Security headers with Helmet
- Input validation and sanitization
