# Firebase Authentication Setup Guide

## Step 1: Create Firebase Project

1. **Go to Firebase Console**: Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. **Create a new project**:
   - Click "Create a project"
   - Enter project name: `rutgers-makerspace-3d-printing`
   - Enable Google Analytics (optional)
   - Choose Analytics account (optional)
   - Click "Create project"

## Step 2: Enable Authentication

1. **In your Firebase project console**:
   - Go to "Authentication" in the left sidebar
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable the following providers:
     - **Email/Password**: Click and enable
     - **Google**: Click and enable (optional but recommended)

## Step 3: Configure Google Sign-In (Optional)

1. **In the Google sign-in provider**:
   - Click "Enable"
   - Add your project's support email
   - Add authorized domains (e.g., `localhost` for development)
   - Save the configuration

## Step 4: Get Firebase Configuration

1. **Go to Project Settings**:
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"
   - Scroll down to "Your apps" section
   - Click "Web" icon `</>`

2. **Register your app**:
   - Enter app nickname: `Rutgers Makerspace Frontend`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

3. **Copy the configuration**:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

## Step 5: Update Environment Variables

1. **Create `.env` file** in the frontend directory:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Update `.env` file** with your Firebase configuration:
   ```bash
   REACT_APP_FIREBASE_API_KEY=your_actual_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_actual_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
   REACT_APP_FIREBASE_APP_ID=your_actual_app_id
   ```

## Step 6: Test the Setup

1. **Start the development server**:
   ```bash
   cd frontend
   npm start
   ```

2. **Test authentication**:
   - Go to `/login` page
   - Try creating a new account
   - Try signing in with existing account
   - Try Google sign-in (if enabled)

## Features Included

### ✅ **Authentication Methods**
- Email/Password sign up and sign in
- Google OAuth sign in
- Password reset functionality
- Email verification

### ✅ **User Experience**
- Protected routes (Print Request page requires login)
- User information display in navbar
- Logout functionality
- Loading states and error handling
- Responsive design

### ✅ **Security**
- Firebase handles all authentication securely
- User sessions are managed automatically
- Password requirements enforced by Firebase
- CSRF protection built-in

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/invalid-api-key)"**:
   - Check your API key in `.env` file
   - Make sure there are no extra spaces or quotes

2. **"Firebase: Error (auth/domain-not-authorized)"**:
   - Add your domain to authorized domains in Firebase Console
   - For development, add `localhost`

3. **Google Sign-In not working**:
   - Check if Google provider is enabled in Firebase Console
   - Verify OAuth consent screen is configured
   - Check authorized domains

4. **Environment variables not loading**:
   - Make sure `.env` file is in the `frontend` directory
   - Restart the development server after changing `.env`
   - Variables must start with `REACT_APP_`

### Development Tips

1. **Firebase Emulator** (Optional):
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Run `firebase init` to set up emulators
   - Use emulators for development to avoid hitting quotas

2. **Testing**:
   - Use test email addresses for development
   - Firebase provides test users in the console
   - Check Firebase Console for user management

3. **Production Deployment**:
   - Update authorized domains for production URL
   - Configure OAuth consent screen for production
   - Set up proper security rules

## Security Rules (Optional)

If you plan to use Firestore for additional data:

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Next Steps

1. **Customize the UI** to match your brand
2. **Add user profile management**
3. **Implement role-based access** if needed
4. **Add password reset functionality**
5. **Set up analytics** for user behavior tracking

Your Firebase authentication is now ready to use! 🎉