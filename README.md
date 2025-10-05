# Rutgers Makerspace HackRU 2025

A comprehensive 3D printing management system with user authentication, community features, and AI-powered recommendations for Rutgers University Makerspace.

## 🚀 Quick Start

### Automated Setup (Recommended)
```bash
# Run the automated setup script
./setup-project.sh
```

This script will:
- ✅ Check prerequisites (Node.js, npm)
- ✅ Install all dependencies
- ✅ Guide you through Firebase configuration
- ✅ Create all necessary `.env` files
- ✅ Provide Firebase Console setup instructions

### Manual Setup
See [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) for detailed manual setup instructions.

### Start the Application
```bash
# Start everything (after setup)
./start-all.sh

# Or start individual services
./start-frontend.sh  # Frontend only (port 8085)
./start-api.sh       # API only (port 8080)
```

## 🌐 Application URLs

- **Frontend**: http://localhost:8085
- **API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api/config

## ✨ Features

### 🔐 Authentication System
- Firebase Authentication integration
- Email/Password and Google OAuth sign-in
- Protected routes and user management
- Secure session handling

### 📊 User Dashboard
- Personal statistics and print history
- Community print request sharing
- Account management and settings
- Real-time status tracking

### 🤖 AI-Powered Features
- Google Gemini integration for intelligent recommendations
- Material advisor with smart suggestions
- Print settings optimization
- Cost estimation and pricing

### 🖨️ 3D Printing Management
- Multiple printer type support
- Material recommendations (PLA, PETG, ABS, etc.)
- Print queue management
- File upload and processing

### 🌐 Community Features
- Public print request sharing
- Community engagement (likes, downloads)
- Open source project collaboration
- Educational resource sharing

## 🏗️ Project Structure

```
├── frontend/              # React.js Frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── firebase/     # Firebase configuration
│   │   └── ...
│   ├── package.json
│   └── README.md
├── api/                   # Node.js/Express API
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Data models
│   │   ├── services/     # External services
│   │   └── ...
│   ├── package.json
│   └── README.md
├── start-all.sh          # Start both services
├── start-frontend.sh     # Start frontend only
├── start-api.sh          # Start API only
└── README.md             # This file
```

## 🛠️ Technology Stack

### Frontend
- **React.js** - User interface
- **Firebase** - Authentication and user management
- **React Router** - Navigation and routing
- **CSS3** - Styling and responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Google Gemini AI** - Intelligent recommendations
- **Snowflake** - Database integration (optional)
- **Winston** - Logging system

### Development Tools
- **ESLint** - Code linting
- **Jest** - Testing framework
- **Nodemon** - Development server

## 🔧 Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project (for authentication)

### 2. Environment Configuration
```bash
# Frontend (.env)
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_BASE_URL=http://localhost:8080

# API (.env)
GEMINI_API_KEY=your_gemini_key
PORT=8080
NODE_ENV=development
```

### 3. Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Email/Password + Google)
3. Add `localhost` to authorized domains
4. Update frontend `.env` with your Firebase config

### 4. Install Dependencies
```bash
# Install frontend dependencies
cd frontend && npm install

# Install API dependencies
cd ../api && npm install
```

## 📚 API Endpoints

### Authentication
- `GET /api/user/print-requests` - User's print history
- `GET /api/community/print-requests` - Public community requests

### 3D Printing
- `POST /api/print-request` - Process print request
- `GET /api/materials` - Available materials
- `GET /api/printers` - Available printers
- `GET /api/pricing` - Pricing information
- `POST /api/estimate-cost` - Cost estimation

### System
- `GET /api/health` - Health check
- `GET /api/config` - API configuration

## 🎯 User Guide

### Getting Started
1. **Sign Up**: Create an account with email/password or Google
2. **Dashboard**: Access your personal dashboard with statistics
3. **Create Request**: Submit a new 3D printing request
4. **Community**: Browse and share public print requests
5. **History**: View your complete print request history

### Dashboard Features
- **Statistics**: Total requests, completed projects, spending
- **Recent Activity**: Quick view of your latest requests
- **Community**: Discover and share projects
- **Account Management**: View and manage your profile

## 🔒 Security Features

- Firebase Authentication with secure token handling
- Protected API endpoints with user verification
- CORS configuration for cross-origin requests
- Input validation and sanitization
- Rate limiting and request logging

## 🚀 Deployment

### Development
```bash
./start-all.sh
```

### Production
1. Configure production environment variables
2. Set up Firebase production project
3. Configure Snowflake database (optional)
4. Deploy frontend to hosting service
5. Deploy API to cloud platform

## 📖 Documentation

- [Frontend Documentation](./frontend/README.md)
- [API Documentation](./api/README.md)
- [Firebase Setup Guide](./frontend/FIREBASE_SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏫 About Rutgers Makerspace

This project was developed for HackRU 2025 to enhance the Rutgers University Makerspace experience with modern web technologies and AI-powered features.