# GenieLearn

A modern collaborative learning platform with AI-powered features for students and study groups.

## ✨ Features

- 📚 **Study Groups** - Create and join collaborative learning spaces
- 💬 **Real-time Chat** - Instant messaging with group members
- 📁 **File Sharing** - Upload and share study materials
- 🤖 **AI Summaries** - Generate summaries for YouTube videos and PDFs using Gemini AI
- 📝 **Personal Notes** - Save and organize your study notes
- ⏱️ **Focus Mode** - Built-in timer with background themes
- 👤 **User Profiles** - Track your learning activities and stats

## 🚀 Tech Stack

- **Next.js 14** - React framework with App Router
- **Appwrite** - Backend (Auth, Database, Storage, Realtime)
- **Google Gemini AI** - AI-powered content summarization
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components

## 🛠️ Setup

### Prerequisites

- Node.js 16+
- Appwrite account ([cloud.appwrite.io](https://cloud.appwrite.io))
- Google Gemini API key ([ai.google.dev](https://ai.google.dev))

### Installation

```bash
# Clone and install
git clone <repository-url>
cd GenieLearn
npm install

# Setup environment
cp .env.example .env.local
```

### Environment Configuration

Edit `.env.local` with your credentials:

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=YOUR_APPWRITE_ENDPOINT
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key

# Appwrite Database
NEXT_PUBLIC_APPWRITE_DATABASE_ID=genielearn
NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID=groups
NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID=messages
NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID=user_profiles
NEXT_PUBLIC_APPWRITE_GROUP_FILES_COLLECTION_ID=group_files
NEXT_PUBLIC_APPWRITE_GROUP_MEMBERS_COLLECTION_ID=group_members
NEXT_PUBLIC_APPWRITE_FOCUS_SESSIONS_COLLECTION_ID=focus_sessions
NEXT_PUBLIC_APPWRITE_PERSONAL_NOTES_COLLECTION_ID=personal_notes
NEXT_PUBLIC_APPWRITE_BUCKET_ID=files

# AI
GEMINI_API_KEY=your_gemini_api_key
```

### Appwrite Setup

See [APPWRITE_SETUP.md](APPWRITE_SETUP.md) for detailed database schema and permissions setup.

### Run Development Server

```bash
# install the dependencies
npm i

# run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📜 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

Build and deploy to any Node.js hosting:

```bash
npm run build
npm start
```

## 📄 License

MIT License
