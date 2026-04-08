# Firestore Deployment Guide

## Quick Deploy (Recommended)

Run this command to deploy all Firestore rules and indexes:

```bash
firebase deploy --only firestore:rules
```

## Issue: Missing or Insufficient Permissions

The chat, achievements, and messaging features require updated Firestore security rules. Follow these steps to deploy:

### Option 1: Using Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not done):
   ```bash
   firebase init firestore
   ```
   - Select your project: `live-code-project`
   - Choose `firestore.rules` as your rules file
   - Choose `firestore.indexes.json` as your indexes file

4. **Deploy Firestore Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `live-code-project`
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Click **Publish**

---

## Issue: Missing Firestore Index

The activity query requires a composite index. You have two options:

### Option 1: Use the Direct Link from Error

The error message contains a direct link to create the index:
```
https://console.firebase.google.com/v1/r/project/live-code-project/firestore/indexes?create_composite=...
```

Simply click this link and confirm to create the index.

### Option 2: Manual Index Creation

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `live-code-project`
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Configure:
   - Collection ID: `submissions`
   - Fields to index:
     - `userId` (Ascending)
     - `timestamp` (Descending)
   - Query scope: Collection
6. Click **Create**

### Option 3: Automatic (Code Already Fixed)

The code has been updated to **avoid requiring the index** by:
- Fetching data without `orderBy`
- Sorting client-side
- This works without creating an index

---

## Verify Deployment

After deploying rules, test the chat feature:

1. Open the app
2. Go to Profile → Messages tab
3. Click "Найти пользователя"
4. Select a user
5. Try sending a message

If you see no permission errors, the deployment was successful! ✅

---

## Firestore Rules Summary

The updated rules add support for:

```
match /chatRooms/{roomId} {
  allow read, create, update, delete: if isAuthenticated();
  
  match /messages/{messageId} {
    allow read, create, update, delete: if isAuthenticated();
  }
}
```

This allows any authenticated user to:
- Create and join chat rooms
- Send and receive messages
- Update message read status
- Delete their own messages
