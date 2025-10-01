# Next.js Migration Guide (JavaScript)

This document outlines the migration from Create React App (CRA) to **Next.js 14 with App Router using JavaScript**.

> **Important**: This migration uses pure JavaScript (`.js` files), not TypeScript.

## What Changed

### 1. Framework & Routing
- **Before**: Create React App with React Router DOM
- **After**: Next.js 14 with App Router (JavaScript)

### 2. Project Structure
```
frontend/
├── app/                    # Next.js App Router pages (NEW)
│   ├── layout.js          # Root layout with StoreProvider
│   ├── page.js            # Home page (redirects to /dashboard)
│   ├── login/
│   │   └── page.js
│   ├── register/
│   │   └── page.js
│   ├── dashboard/
│   │   └── page.js
│   ├── groups/
│   │   └── page.js
│   └── profile/
│       └── page.js
├── src/                    # Existing components and utilities
│   ├── components/
│   ├── store/
│   ├── utils/
│   └── hooks/
└── public/                 # Static assets
```

### 3. Key File Changes

#### Package.json
- Removed: `react-scripts`, `react-router-dom`
- Added: `next` (14.2.0+)
- Updated scripts:
  - `npm run dev` - Start development server
  - `npm run build` - Create production build
  - `npm start` - Run production server
  - `npm run lint` - Run ESLint

#### Environment Variables
All environment variables now use `NEXT_PUBLIC_` prefix:
- `REACT_APP_BACKEND_URL` → `NEXT_PUBLIC_BACKEND_URL`
- `REACT_APP_WS_URL` → `NEXT_PUBLIC_WS_URL`

#### Configuration Files
- **NEW**: `next.config.js` - Next.js configuration
- **NEW**: `.eslintrc.json` - ESLint for Next.js
- **UPDATED**: `jsconfig.json` - Module resolution paths
- **UPDATED**: `tailwind.config.js` - Include app directory

### 4. Component Changes

#### All Interactive Components
Added `'use client'` directive at the top of files that use:
- React hooks (useState, useEffect, etc.)
- Event handlers
- Browser APIs (localStorage, etc.)
- Redux hooks (useSelector, useDispatch)

#### Navigation Changes
```javascript
// Before (React Router)
import { Link, useNavigate } from 'react-router-dom';

const Component = () => {
  const navigate = useNavigate();
  return <Link to="/path">Link</Link>;
};

// After (Next.js)
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Component = () => {
  const router = useRouter();
  return <Link href="/path">Link</Link>;
};
```

#### Protected Routes
```javascript
// Before: Used React Router's Navigate component
// After: Uses Next.js router.replace() for redirects
```

### 5. Redux Store Setup

Created a new `StoreProvider` component to wrap the Redux Provider:
```javascript
// src/components/StoreProvider.js
'use client'
import { Provider } from 'react-redux'
import { store } from '../store'

export default function StoreProvider({ children }) {
  return <Provider store={store}>{children}</Provider>
}
```

### 6. SSR Compatibility

Fixed localStorage access to work with Server-Side Rendering:
```javascript
// Before
const token = localStorage.getItem('token');

// After
const token = typeof window !== 'undefined' 
  ? localStorage.getItem('token') 
  : null;
```

## Running the Application

### Development
```bash
# Project is now in root directory
npm install
npm run dev
```
Visit http://localhost:3000

### Production
```bash
# Project is now in root directory
npm run build
npm start
```

### Environment Setup
Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
NEXT_PUBLIC_WS_URL=ws://localhost:8001
```

## Benefits of Next.js

1. **Better Performance**: Automatic code splitting and optimization
2. **SEO Friendly**: Server-side rendering capabilities
3. **File-based Routing**: Intuitive routing system
4. **Built-in Optimization**: Image optimization, font optimization
5. **Modern Development**: Hot Module Replacement, Fast Refresh
6. **Production Ready**: Optimized builds out of the box

## Compatibility Notes

- All existing components work with minimal changes
- Redux state management remains unchanged
- Tailwind CSS configuration works as before
- UI components (Radix UI) are fully compatible
- WebSocket connections work the same way

## Troubleshooting

### localStorage errors
If you see "localStorage is not defined" errors:
- Ensure `'use client'` directive is added to components using localStorage
- Check that localStorage access is wrapped with `typeof window !== 'undefined'`

### Import errors
If modules can't be resolved:
- Check `jsconfig.json` path configurations
- Ensure imports use correct relative or absolute paths

### Build errors
If the build fails:
- Run `npm run lint` to check for linting errors
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

## Migration Checklist

✅ Install Next.js dependencies
✅ Create app directory structure
✅ Update environment variables
✅ Add 'use client' to interactive components
✅ Update routing (Link, useNavigate → useRouter)
✅ Fix localStorage for SSR
✅ Update configuration files
✅ Test development server
✅ Test production build
✅ Update documentation

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Migrating from CRA](https://nextjs.org/docs/app/building-your-application/upgrading/from-create-react-app)
- [Next.js with Redux](https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#client-side-fetching)
