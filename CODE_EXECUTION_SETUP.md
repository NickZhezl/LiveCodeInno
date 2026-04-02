# Code Execution Setup

## Problem
The Piston API (emkc.org) has changed their authentication requirements and now returns 401 errors.

## Solutions

### Option 1: Self-hosted Piston (Recommended for Production)

1. **Install Docker** (if not already installed)

2. **Run Piston locally:**
   ```bash
   docker run -d -p 3000:3000 ghcr.io/engineer-man/piston:latest
   ```

3. **Update the API endpoint** in `src/utils/codeExecutor.ts`:
   ```typescript
   const PISTON_API = "http://localhost:3000/api/v2/piston/execute";
   ```

4. **Benefits:**
   - Full control
   - No rate limits
   - Works offline
   - More secure

### Option 2: Judge0 API (Quick Setup)

1. **Get a free API key** from [RapidAPI](https://rapidapi.com/judge0-judge0-default/api/judge0-ce)

2. **Update `src/utils/codeExecutor.ts`** to use the Judge0 implementation (already included in the file)

3. **Add your API key:**
   ```typescript
   "X-RapidAPI-Key": "your-actual-key-here",
   ```

### Option 3: Demo Mode (Current)

The current implementation includes a fallback "demo mode" that shows the code but doesn't execute it. This is useful for:
- Development
- Demonstrations
- UI testing

## Features Implemented

### 1. Dashboard
- Main navigation hub
- Quick interview start
- Section cards

### 2. Live Coding
- Real-time collaboration
- Shared cursors
- Multiple languages
- Problem selection

### 3. Python Topics (8 topics, 20+ lessons)
- Basic: Data Types, Control Flow, Functions
- Intermediate: Data Structures, Exception Handling, OOP
- Advanced: Descriptors, Metaclasses

### 4. Homework (9 assignments)
- Auto-check with test cases
- Levels 1-9
- Detailed feedback

### 5. Problems Bank (11 problems)
- Easy/Medium/Hard difficulty
- Timer for each problem
- Test case validation

## Deployment

### Vercel
```bash
npm run build
vercel --prod
```

The `vercel.json` is already configured for SPA routing.

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## Admin Panel

Access at `/admin` (requires admin role in Firestore)

### Create First Admin:
1. Register a user
2. Go to Firebase Console → Firestore
3. Find user in `users` collection
4. Change `role` from `"user"` to `"admin"`

## Firebase Setup

### Enable Email/Password Auth:
1. Firebase Console → Authentication → Sign-in method
2. Add provider → Email/Password
3. Enable and Save

### Deploy Security Rules:
```bash
firebase login
firebase use live-code-project
firebase deploy --only firestore:rules
```
