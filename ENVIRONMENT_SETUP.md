# Environment Setup Guide

This guide explains the environment variables required for the MVP application.

## Backend Environment Variables (.env)

The backend requires the following environment variables:

### MongoDB Configuration

- `MONGO_URL`: MongoDB connection string
  - Example: `mongodb://localhost:27017/mvp_database`
  - For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database`

### JWT Configuration

- `SECRET_KEY`: Secret key for JWT token signing
  - **Important**: Use a strong, random key in production
  - Generate with: `openssl rand -hex 32`

### Server Configuration

- `PORT`: Port number for the backend server (default: 8001)

### CORS Configuration

- `CORS_ORIGINS`: Comma-separated list of allowed origins
  - Development: `http://localhost:3000,http://127.0.0.1:3000`
  - Production: Add your production frontend URL

### Environment

- `NODE_ENV`: Current environment (development/production)

## Frontend Environment Variables (.env)

The frontend requires the following React environment variables (must start with `REACT_APP_`):

### Backend API Configuration

- `REACT_APP_BACKEND_URL`: URL of your backend server
  - Development: `http://localhost:8001`
  - Production: Your production backend URL

### Environment

- `REACT_APP_ENV`: Current environment (development/production)

### WebSocket Configuration

- `REACT_APP_WS_URL`: WebSocket URL for real-time features
  - Development: `ws://localhost:8001`
  - Production: Your production WebSocket URL

## Setup Instructions

1. **Backend Setup**:

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your actual values
   ```

2. **Frontend Setup**:

   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **MongoDB Setup**:

   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGO_URL` in backend/.env

4. **Security Notes**:
   - Never commit `.env` files to version control
   - Use strong, unique values for `SECRET_KEY`
   - Update CORS origins for production

## Production Considerations

- Use environment-specific values
- Enable HTTPS in production
- Use secure MongoDB connections
- Set NODE_ENV=production
- Use production-ready JWT secrets
