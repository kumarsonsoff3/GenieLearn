# GenieLearn

A real-time learning platform that enables students to form study groups, participate in discussions, and collaborate on learning materials.

## 🚀 Technology Stack

- **Next.js 14** with App Router (JavaScript)
- **React 18** with modern hooks
- **Redux Toolkit** for state management
- **Appwrite** for backend services:
  - Authentication (Users & Sessions)
  - Database (Groups, Messages, User Profiles)
  - Realtime (Live chat functionality)
  - Storage (File uploads)
- **Tailwind CSS** + **Radix UI** for styling

> **Note**: This is a **full-stack Next.js application** using JavaScript (not TypeScript)

## 📋 Features

- **User Authentication**: Secure registration and login with Appwrite
- **Study Groups**: Create and join study groups by interest
- **Real-time Chat**: Live messaging with Appwrite Realtime
- **Group Management**: Join/leave groups, view member counts
- **Responsive Design**: Works on desktop and mobile
- **Session-based Auth**: Cookie-based authentication

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Appwrite account (cloud or self-hosted)
- Git

### Quick Start

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd GenieLearn
   ```

2. **Setup Appwrite**:

   Follow the detailed guide in [frontend/APPWRITE_SETUP.md](frontend/APPWRITE_SETUP.md) to:
   - Create Appwrite project
   - Create database and collections
   - Generate API key
   - Configure permissions

3. **Frontend Setup**:

   ```bash
   cd frontend
   npm install
   
   # Create .env.local file with:
   cp .env.example .env.local
   # Edit .env.local with your Appwrite credentials
   
   npm run dev
   ```

4. **Access the application**:
   - Application: http://localhost:3000
   - Next.js API: http://localhost:3000/api

## 📁 Project Structure

```
GenieLearn/
├── frontend/               # Full-stack Next.js application
│   ├── app/               # Next.js App Router
│   │   ├── api/          # Next.js API Routes (backend)
│   │   │   ├── auth/     # Authentication endpoints
│   │   │   ├── groups/   # Groups endpoints
│   │   │   └── messages/ # Messages endpoints
│   │   ├── layout.js     # Root layout
│   │   ├── page.js       # Home page
│   │   ├── login/        # Login page
│   │   ├── register/     # Register page
│   │   ├── dashboard/    # Dashboard page
│   │   ├── groups/       # Groups page
│   │   └── profile/      # Profile page
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/        # Redux store and slices
│   │   ├── utils/        # Utility functions
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Appwrite configuration
│   ├── public/           # Static assets
│   ├── APPWRITE_SETUP.md # Appwrite setup guide
│   ├── next.config.js    # Next.js configuration
│   └── package.json
│
└── README.md
```
│   │   └── hooks/        # Custom React hooks
│   ├── public/           # Static assets
│   ├── next.config.js    # Next.js configuration
└── README.md
```

## 🔗 API Endpoints

All API endpoints are Next.js API routes located in `/app/api/*`:

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (creates session cookie)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Groups

- `GET /api/groups/list` - Get all public groups
- `GET /api/groups/my-groups` - Get user's groups
- `POST /api/groups/create` - Create a new group
- `POST /api/groups/[groupId]/join` - Join a group
- `POST /api/groups/[groupId]/leave` - Leave a group
- `GET /api/groups/[groupId]/messages` - Get group messages
- `GET /api/groups/stats` - Get platform statistics

### Messages

- `POST /api/messages/create` - Send a message
- Real-time updates via Appwrite Realtime subscriptions

## 🎯 Recent Updates

- ✅ **Full Next.js Migration**: Migrated entire application to Next.js 14
- ✅ **Appwrite Integration**: Replaced Express/MongoDB with Appwrite
- ✅ **Backend Removal**: Consolidated to single Next.js application
- ✅ **API Routes**: All backend logic now in Next.js API routes
- ✅ **Appwrite Realtime**: Real-time chat with Appwrite subscriptions
- ✅ **Session Auth**: Cookie-based authentication instead of JWT tokens
- ✅ **JavaScript Only**: Pure JavaScript implementation (no TypeScript)

## 🚦 Development Status

- ✅ Full-stack Next.js application running on port 3000
- ✅ API routes implemented and functional
- ✅ Real-time messaging with Appwrite Realtime
- ✅ Production build optimized and tested
- ✅ All features migrated from Express backend
- 🔄 Requires Appwrite project setup (see APPWRITE_SETUP.md)

## 📚 Additional Documentation

- [APPWRITE_SETUP.md](frontend/APPWRITE_SETUP.md) - Complete Appwrite setup guide
- [MIGRATION.md](frontend/MIGRATION.md) - Next.js migration details
- [MIGRATION_SUMMARY.md](frontend/MIGRATION_SUMMARY.md) - Quick reference
- [frontend/README.md](frontend/README.md) - Frontend-specific documentation

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📜 License

This project is licensed under the MIT License.
