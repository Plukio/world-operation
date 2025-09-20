# Firebase Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `world-operation` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

## 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) icon
4. Register your app with a nickname (e.g., "world-operation-web")
5. Copy the Firebase configuration object

## 4. Set Environment Variables

Create a `.env.local` file in the `frontend/` directory with your Firebase config:

```env
# API Configuration
VITE_API_BASE=http://localhost:8000
VITE_API_KEY=dev-key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 5. Firestore Security Rules (Development)

For development, use these permissive rules in Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Warning: These rules allow anyone to read/write your data. Only use for development!**

## 6. Firestore Collections Structure

The app will create these collections automatically:

- `scenes` - Current scene content
- `sceneVersions` - Version history of scenes

## 7. Test the Setup

1. Start the frontend: `pnpm run dev`
2. Open the app in your browser
3. Start typing in a scene
4. Check the browser console for Firebase connection logs
5. Check Firestore in Firebase Console to see data being saved

## 8. Production Security Rules

For production, use proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scenes/{sceneId} {
      allow read, write: if request.auth != null;
    }
    match /sceneVersions/{versionId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Common Issues:

1. **"Firebase not initialized"** - Check your environment variables
2. **"Permission denied"** - Check Firestore security rules
3. **"Network error"** - Check internet connection and Firebase project status
4. **"Invalid API key"** - Verify your Firebase configuration

### Debug Mode:

Add this to your browser console to see Firebase logs:
```javascript
localStorage.setItem('firebase:debug', '*');
```

## Next Steps

Once Firebase is set up:
1. Auto-save will work automatically
2. Content will be saved to Firestore
3. You can view saved content in Firebase Console
4. Real-time updates will work across browser tabs
