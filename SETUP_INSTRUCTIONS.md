# Rutgers Makerspace Project Setup Instructions

## 🚀 Quick Setup (Automated)

### Prerequisites
- Node.js (v18 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)
- A Firebase project (we'll guide you through this)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd Rutgers-Makerspace-HackRU-2025
```

### 2. Run the Automated Setup Script
```bash
./setup-project.sh
```

The script will:
- ✅ Check prerequisites (Node.js, npm)
- ✅ Install all dependencies
- ✅ Guide you through Firebase configuration
- ✅ Create all necessary `.env` files
- ✅ Provide Firebase Console setup instructions
- ✅ Optionally test the setup

### 3. Complete Firebase Console Setup
After running the script, you'll need to enable Authentication in Firebase Console:

1. **Go to**: https://console.firebase.google.com/project/YOUR_PROJECT_ID
2. **Click "Authentication"** in the left sidebar
3. **Click "Get started"**
4. **Go to "Sign-in method" tab**
5. **Enable these providers**:
   - ✅ **Email/Password** - Click and toggle "Enable"
   - ✅ **Google** - Click and toggle "Enable" (optional but recommended)
6. **For Google sign-in**, add authorized domains:
   - Add `localhost` for development
   - Add your production domain when ready

### 4. Start the Application
```bash
./start-all.sh
```

### 5. Access the Application
- **Frontend**: http://localhost:8085
- **API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api/config

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually or the automated script doesn't work:

### 1. Install Dependencies
```bash
# Frontend dependencies
cd frontend
npm install
cd ..

# API dependencies
cd api
npm install
cd ..
```

### 2. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `rutgers-makerspace-3d-printing`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 3. Get Firebase Configuration
1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Web" icon `</>`
4. Register app with nickname: `Rutgers Makerspace Frontend`
5. Copy the configuration object

### 4. Create Frontend Environment File
Create `frontend/.env`:
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8080
```

### 5. Create API Environment File
Create `api/.env`:
```bash
# Server Configuration
PORT=8080
NODE_ENV=development
DEBUG=true

# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent

# Rutgers Makerspace Configuration
MAKERSPACE_NAME=Rutgers Makerspace
MAKERSPACE_LOCATION=Engineering Building, Rutgers University

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 6. Enable Firebase Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Enable "Google" (optional)
6. Add `localhost` to authorized domains

## 🧪 Testing the Setup

### 1. Start the Application
```bash
./start-all.sh
```

### 2. Test Authentication
1. Open http://localhost:8085
2. Click "Login" in the navbar
3. Try creating a new account
4. Try signing in with existing account
5. Test Google sign-in (if enabled)

### 3. Test Dashboard
1. After logging in, you should be redirected to the dashboard
2. Check that statistics are displayed
3. Test the Community and History tabs
4. Try the "Create New Print Request" button

## 🔧 Troubleshooting

### Common Issues

#### "Firebase: Error (auth/invalid-api-key)"
- Check your API key in `frontend/.env`
- Make sure there are no extra spaces or quotes
- Restart the development server

#### "Firebase: Error (auth/domain-not-authorized)"
- Add `localhost` to authorized domains in Firebase Console
- Go to Authentication → Settings → Authorized domains

#### "Port already in use"
- The scripts will warn you if ports are in use
- Kill existing processes or use different ports
- Check what's running on ports 8080 and 8085

#### "Module not found" errors
- Run `npm install` in both frontend and api directories
- Make sure you're in the correct directory
- Check that all dependencies are installed

#### Google Sign-In not working
- Check if Google provider is enabled in Firebase Console
- Verify OAuth consent screen is configured
- Check authorized domains include `localhost`

### Getting Help

1. **Check the logs**: Look at browser console and terminal output
2. **Verify configuration**: Make sure all `.env` files are correct
3. **Test Firebase**: Verify your Firebase project is set up correctly
4. **Check documentation**: Read the README files in frontend/ and api/

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [Project README](./README.md)

## 🎯 Next Steps

Once the setup is complete:

1. **Customize the UI** to match your brand
2. **Add more features** to the dashboard
3. **Set up Snowflake database** for real data storage
4. **Deploy to production** when ready
5. **Add more community features**

## 🏫 About Rutgers Makerspace

This project was developed for HackRU 2025 to enhance the Rutgers University Makerspace experience with modern web technologies and AI-powered features.

---

**Need help?** Check the troubleshooting section above or create an issue in the repository.