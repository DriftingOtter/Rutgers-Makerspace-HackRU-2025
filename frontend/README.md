# Rutgers Makerspace Frontend

A modern React.js frontend application for the Rutgers Makerspace 3D printing management system with Firebase authentication and user dashboard.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project (for authentication)

### Installation
```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Update .env with your Firebase configuration
# Edit .env file with your Firebase project settings

# Start the development server
npm start
```

The application will be available at http://localhost:8085

## ✨ Features

### 🔐 Authentication System
- **Firebase Authentication**: Email/password and Google OAuth sign-in
- **Protected Routes**: Secure access to user-specific features
- **User Management**: Profile management and session handling
- **Secure Logout**: Proper session cleanup and redirection

### 📊 User Dashboard
- **Personal Statistics**: Print request counts, spending, completion rates
- **Recent Activity**: Quick view of latest print requests
- **Account History**: Complete print request history with status tracking
- **Community Features**: Browse and share public print requests

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Rutgers Branding**: Consistent red color scheme (#d32f2f)
- **Interactive Components**: Hover effects, loading states, and animations
- **Accessibility**: Proper ARIA labels and keyboard navigation

### 🖨️ 3D Printing Integration
- **Print Request Form**: Submit new 3D printing requests
- **Material Selection**: Choose from available materials
- **Cost Estimation**: Real-time cost calculations
- **Status Tracking**: Monitor request progress

## 🏗️ Project Structure

```
src/
├── components/           # Reusable React components
│   ├── Navbar.js        # Navigation bar with user info
│   ├── Footer.js        # Footer component
│   ├── ProtectedRoute.js # Route protection wrapper
│   └── ...
├── pages/               # Page components
│   ├── Home.js          # Landing page
│   ├── Login.js         # Authentication page
│   ├── UserDashboard.js # User dashboard
│   ├── PrintRequest.js  # Print request form
│   └── AboutMe.js       # About page
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication context
├── firebase/            # Firebase configuration
│   ├── config.js        # Firebase app configuration
│   └── auth.js          # Authentication utilities
├── Images/              # Static images and assets
└── ...
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

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

### Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password + Google)

2. **Configure Authentication**
   - Add `localhost` to authorized domains
   - Enable Google sign-in (optional)
   - Update `.env` with your Firebase config

## 🎯 User Guide

### Getting Started
1. **Sign Up**: Create an account with email/password or Google
2. **Dashboard**: Access your personal dashboard with statistics
3. **Create Request**: Submit a new 3D printing request
4. **Community**: Browse and share public print requests
5. **History**: View your complete print request history

### Dashboard Features
- **Statistics Tab**: Overview of your print activity
- **Community Tab**: Discover and share public projects
- **History Tab**: Complete request history with details

### Navigation
- **Home**: Landing page with makerspace information
- **About**: Image gallery and makerspace details
- **Dashboard**: Personal user dashboard (requires login)
- **Print Request**: Submit new requests (requires login)

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App
npm run eject
```

### Development Server
The app runs on port 8085 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=3000 npm start
```

## 🎨 Styling

The application uses custom CSS with a consistent design system:

- **Color Scheme**: Rutgers red (#d32f2f) with complementary colors
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Reusable button and card styles
- **Responsive**: Mobile-first design with breakpoints
- **Animations**: Subtle hover effects and transitions

## 🔒 Security

- **Firebase Authentication**: Secure user authentication
- **Protected Routes**: Route-level access control
- **Input Validation**: Client-side form validation
- **CORS Configuration**: Secure API communication
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

The build folder contains the production-ready files that can be deployed to any static hosting service.

### Environment Variables
Make sure to set the correct environment variables for production:
- Update Firebase configuration for production domain
- Set correct API base URL
- Configure any additional production settings

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🏫 About Rutgers Makerspace

This frontend was developed for HackRU 2025 to enhance the Rutgers University Makerspace experience with modern web technologies and user-friendly interfaces.
