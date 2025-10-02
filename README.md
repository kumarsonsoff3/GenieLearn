# GenieLearn - Full-Stack Next.js Application (JavaScript)

A real-time learning platform built with **Next.js 14 with App Router and Appwrite backend**, using pure JavaScript.

## 🚀 Tech Stack

- **Next.js 14** - Full-stack React framework with App Router (JavaScript)
- **React 18** - UI library
- **Redux Toolkit** - State management
- **Appwrite** - Backend services (Auth, Database, Realtime, Storage)
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Lucide React** - Icons

> **Note**: This is a full-stack application using JavaScript (`.js` files) throughout, not TypeScript.

## 📁 Project Structure

```
GenieLearn/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API Routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── groups/       # Groups endpoints
│   │   └── messages/     # Messages endpoints
│   ├── layout.js          # Root layout
│   ├── page.js            # Home page
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── dashboard/         # Dashboard page
│   ├── groups/            # Groups page
│   └── profile/           # Profile page
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── profile/      # Profile components
│   │   ├── shared/       # Shared components
│   │   └── ui/           # UI components (Radix UI)
│   ├── store/            # Redux store
│   │   ├── authSlice.js  # Auth state management
│   │   └── index.js      # Store configuration
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Appwrite configuration
│       ├── appwrite.js         # Client SDK
│       ├── appwrite-server.js  # Server SDK
│       └── appwrite-config.js  # Constants
├── public/               # Static assets
├── APPWRITE_SETUP.md     # Appwrite setup guide
└── next.config.js        # Next.js configuration
```

## 🛠️ Setup

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Appwrite account (cloud or self-hosted)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Appwrite Setup

**Quick Setup (Recommended):**
```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login to Appwrite
appwrite login

# Run automated setup script
node appwrite-setup.js your-project-id-here
```

This automated script will create all databases, collections, attributes, and indexes for you!

For manual setup or troubleshooting, see [APPWRITE_SETUP.md](APPWRITE_SETUP.md) and [SETUP_SCRIPTS_README.md](SETUP_SCRIPTS_README.md).

### Environment Variables

Create a `.env.local` file with your Appwrite credentials:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key

# Appwrite Database Configuration
NEXT_PUBLIC_APPWRITE_DATABASE_ID=genielearn
NEXT_PUBLIC_APPWRITE_COLLECTION_GROUPS=groups
NEXT_PUBLIC_APPWRITE_COLLECTION_MESSAGES=messages
NEXT_PUBLIC_APPWRITE_COLLECTION_USER_PROFILES=user_profiles
NEXT_PUBLIC_APPWRITE_BUCKET_ID=files
```

## 📜 Available Scripts

### Development

```bash
npm run dev
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
```

Creates an optimized production build in the `.next` folder.

### Start Production Server

```bash
npm start
```

Runs the production build. Must run `npm run build` first.

### Linting

```bash
npm run lint
```

Runs ESLint to check for code quality issues.

## 🎨 Features

- **Server-Side Rendering (SSR)** - Fast initial page loads
- **Static Site Generation (SSG)** - Pre-rendered pages
- **File-based Routing** - Automatic routing from file structure
- **API Routes** - Built-in API endpoints (if needed)
- **JavaScript-based** - Pure JavaScript implementation without TypeScript
- **Image Optimization** - Automatic image optimization
- **Code Splitting** - Automatic code splitting for better performance
- **Hot Module Replacement** - Fast refresh during development

## 🔐 Authentication

The app uses JWT-based authentication with Redux for state management:

- Login/Register pages for user authentication
- Protected routes using `ProtectedRoute` component
- Token stored in localStorage (with SSR safety checks)
- Automatic token refresh and validation

## 🗂️ State Management

Redux Toolkit is used for global state management:

- **Auth State**: User authentication, login, logout
- **Store Provider**: Client-side Redux provider wrapper
- **Persisted State**: Token persistence with localStorage

## 🎨 Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible components
- **Custom Components** - Pre-styled UI components in `src/components/ui/`

## 📱 Pages

- `/` - Home (redirects to dashboard)
- `/login` - User login
- `/register` - User registration
- `/dashboard` - User dashboard (protected)
- `/groups` - Study groups (protected)
- `/profile` - User profile (protected)

## 🔄 Migration from CRA

This project was migrated from Create React App to Next.js. See [MIGRATION.md](./MIGRATION.md) for details.

### Key Changes

- React Router → Next.js App Router
- `REACT_APP_*` → `NEXT_PUBLIC_*` environment variables
- Added `'use client'` directive to client components
- SSR-safe localStorage access
- Updated import paths and navigation

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

1. Build the app: `npm run build`
2. Start the server: `npm start`
3. Or deploy the `.next` folder to your hosting service

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Redux Toolkit](https://redux-toolkit.js.org)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

