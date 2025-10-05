# Rutgers Makerspace Demo Guide

## 🚀 Quick Start
```bash
./setup.sh    # One-time setup
./start-demo.sh    # Start demo
```

## 🌐 Access Points
- **Frontend**: http://localhost:8085
- **API**: http://localhost:8080
- **API Health**: http://localhost:8080/api/health

## 🎯 Demo Features to Show

### 1. Authentication
- **Login Page**: http://localhost:8085/login
- **Test Credentials**: Use any email/password (Firebase auth)
- **Admin Login**: Use the admin toggle for admin features

### 2. User Dashboard
- **URL**: http://localhost:8085/dashboard
- **Features**:
  - View print request history
  - Browse community projects
  - 3D model viewer with rotation
  - Make projects public/private

### 3. Print Request
- **URL**: http://localhost:8085/print-request
- **Features**:
  - Material/color dropdowns
  - File upload
  - Cost estimation
  - Form validation

### 4. Admin Dashboard
- **URL**: http://localhost:8085/admin
- **Features**:
  - View all print requests
  - Equipment management
  - User management
  - 3D model viewer in modals

### 5. Community Features
- **Public Projects**: Browse community print requests
- **3D Models**: Interactive 3D model viewer
- **Material Info**: Detailed material specifications

## 🔧 Technical Features
- **Database**: Snowflake integration with real data
- **3D Viewer**: Three.js with rotation, zoom, pan
- **Authentication**: Firebase Auth with Google OAuth
- **Responsive**: Mobile-friendly design
- **Real-time**: Live data updates

## 📱 Mobile Demo
- Responsive design works on mobile
- Touch controls for 3D models
- Mobile-optimized forms

## 🎨 Design Highlights
- Rutgers red color scheme (#d32f2f)
- Consistent card-based layout
- Professional typography
- Smooth animations
- Intuitive navigation
