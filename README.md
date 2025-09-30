# GenieLearn

A real-time learning platform that enables students to form study groups, participate in discussions, and collaborate on learning materials.

## 🚀 Technology Stack

### Frontend

- **React** 19.x with modern hooks
- **Redux Toolkit** for state management
- **React Router DOM** for navigation
- **Tailwind CSS** + **Radix UI** for styling
- **Axios** for API calls
- **WebSocket** for real-time messaging

### Backend

- **Node.js** + **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** authentication with **bcryptjs**
- **WebSocket** for real-time features
- **Helmet** + **CORS** for security

## 📋 Features

- **User Authentication**: Secure registration and login
- **Study Groups**: Create and join study groups by interest
- **Real-time Chat**: Live messaging within groups
- **Group Management**: Join/leave groups, view member counts
- **Responsive Design**: Works on desktop and mobile
- **Real-time Notifications**: User join/leave notifications

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Quick Start

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd app
   ```

2. **Backend Setup**:

   ```bash
   cd backend
   npm install

   # Create .env file with:
   # MONGO_URL=mongodb://localhost:27017/genielearn
   # SECRET_KEY=your-jwt-secret-key
   # PORT=8001
   # CORS_ORIGINS=http://localhost:3000

   npm start
   ```

3. **Frontend Setup**:

   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001

## 📁 Project Structure

```
app/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/        # Redux store and slices
│   │   ├── utils/        # Utility functions (axios config)
│   │   └── hooks/        # Custom React hooks
│   ├── public/           # Static assets
│   └── package.json
│
├── backend/               # Node.js backend application
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   └── package.json
│
└── README.md
```

## 🔗 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Groups

- `GET /api/groups` - Get all public groups
- `GET /api/groups/my-groups` - Get user's groups
- `POST /api/groups` - Create a new group
- `POST /api/groups/:id/join` - Join a group
- `POST /api/groups/:id/leave` - Leave a group

### Messages

- `GET /api/groups/:id/messages` - Get group messages
- `WS /ws/:groupId?token=JWT` - Real-time messaging

## 🎯 Recent Updates

- ✅ **Complete Migration**: Migrated from Python/FastAPI to Node.js/Express
- ✅ **Frontend Fixed**: Resolved all dependency conflicts and import issues
- ✅ **Real-time Messaging**: WebSocket implementation for live chat
- ✅ **Security**: JWT authentication, rate limiting, CORS protection
- ✅ **Modern Stack**: Latest React 19, Express, MongoDB with Mongoose

## 🚦 Development Status

- ✅ Frontend: Running successfully on port 3000
- ✅ Backend: Complete Node.js implementation on port 8001
- ✅ API: All endpoints implemented and tested
- ✅ Real-time: WebSocket messaging system ready
- 🔄 Database: Requires MongoDB connection for full functionality

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License.
