# Rutgers Makerspace - AI-Powered 3D Print Management Platform

> **A modern, intelligent 3D printing management system that transforms the makerspace experience through AI-driven recommendations, community collaboration, and seamless user workflows.**

Built for HackRU 2025 |

---

## 🎯 Overview

Rutgers Makerspace is a comprehensive web application designed to streamline 3D printing workflows at Rutgers University. By combining cutting-edge AI technology with intuitive design, we've created a platform that makes 3D printing accessible, efficient, and collaborative for students, faculty, and makers of all skill levels.

### The Problem We Solved
Traditional makerspace management systems are often disconnected, difficult to use, and lack intelligent guidance for users unfamiliar with 3D printing. We built a solution that:
- **Reduces barriers to entry** for new makers through AI-powered material recommendations
- **Optimizes resource allocation** with intelligent print queue management
- **Fosters community collaboration** through project sharing and knowledge exchange
- **Provides transparency** with real-time cost estimation and print tracking

---

## ✨ Key Features

### 🤖 **AI-Powered Intelligence**
- **Google Gemini Integration** - Smart material advisor that recommends optimal materials (PLA, PETG, ABS, TPU) based on project requirements
- **Automated Cost Estimation** - Real-time pricing calculations considering material, print time, and complexity
- **Print Settings Optimization** - AI suggests ideal settings for different materials and printer types

### 🔐 **Enterprise-Grade Authentication**
- Firebase Authentication with email/password and Google OAuth
- Secure session management and protected routes
- Role-based access control for different user types
- Seamless user experience with persistent login

### 📊 **Personalized Dashboard**
- **Real-time Statistics** - Track total requests, completed projects, and spending
- **Print History** - Complete timeline of all your 3D printing projects
- **Request Status Tracking** - Monitor prints from submission to completion
- **Quick Actions** - Fast access to frequently used features

### 🌐 **Community Platform**
- **Public Project Sharing** - Share successful prints with the community
- **Social Engagement** - Like, comment, and download community projects
- **Knowledge Base** - Learn from others' successes and challenges
- **Open Source Collaboration** - Foster innovation through shared resources

### 🖨️ **Comprehensive Print Management**
- Support for multiple printer types (FDM, SLA, Multi-material)
- Material library with detailed specifications and recommendations
- File upload and validation for common 3D formats
- Queue management and priority scheduling
- Automated notifications for print status updates

### 💰 **Transparent Pricing**
- Dynamic cost calculation based on material and print parameters
- Pricing tiers for different user types (student, faculty, external)
- Detailed cost breakdowns before submission
- Budget tracking and spending analytics

---

## 🎬 Demo & Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Screenshot)

### AI Material Advisor
![AI Advisor](https://via.placeholder.com/800x400?text=AI+Advisor+Screenshot)

### Community Platform
![Community](https://via.placeholder.com/800x400?text=Community+Screenshot)

---

## 🏗️ Technical Architecture

### **Frontend Stack**
- **React.js** - Modern, component-based UI architecture
- **Firebase SDK** - Seamless authentication and user management
- **React Router v6** - Advanced routing with protected routes
- **Responsive Design** - Mobile-first CSS3 with flexbox/grid

### **Backend Stack**
- **Node.js + Express** - High-performance REST API
- **Google Gemini AI** - Advanced natural language processing for recommendations
- **Winston Logger** - Comprehensive logging and monitoring
- **Snowflake** - Scalable database integration (optional)

### **Security & Performance**
- JWT-based authentication with Firebase tokens
- CORS configuration for secure cross-origin requests
- Input validation and sanitization
- Rate limiting on API endpoints
- Optimized build process with code splitting

---

## 🚀 Quick Demo

Get the application running in under 2 minutes:

### **One-Command Setup**
```bash
# Clone the repository
git clone <repository-url>
cd rutgers-makerspace

# Automated setup and start
./setup.sh && ./start-demo.sh
```

The application will be available at:
- **Frontend**: http://localhost:8085
- **API**: http://localhost:8080
- **API Docs**: http://localhost:8080/api/config

### **Alternative Setup Methods**

#### Using Individual Scripts
```bash
# Setup with configuration prompts
./old-scripts/setup-project.sh

# Start frontend only
./start-frontend.sh

# Start API only
./start-api.sh

# Start both services
./start-all.sh
```

#### Manual Setup
```bash
# 1. Install dependencies
cd frontend && npm install
cd ../api && npm install

# 2. Configure environment variables (see below)
cp frontend/.env.example frontend/.env
cp api/.env.example api/.env

# 3. Start services
cd frontend && npm start  # Port 8085
cd api && npm start       # Port 8080
```

---

## ⚙️ Configuration

### **Environment Variables**

#### Frontend (`frontend/.env`)
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_API_BASE_URL=http://localhost:8080
```

#### Backend (`api/.env`)
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=8080
NODE_ENV=development
LOG_LEVEL=info
```

### **Firebase Setup**
1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication methods:
   - Email/Password
   - Google OAuth
3. Add `localhost` to authorized domains
4. Copy configuration values to `frontend/.env`

---

## 📚 API Documentation

### **Authentication Endpoints**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/print-requests` | Fetch user's print history |
| GET | `/api/user/stats` | Get user statistics |

### **Print Management**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/print-request` | Submit new print request |
| GET | `/api/materials` | List available materials |
| GET | `/api/printers` | List available printers |
| POST | `/api/estimate-cost` | Calculate print cost |

### **Community Features**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/community/print-requests` | Browse public projects |
| POST | `/api/community/like` | Like a project |
| POST | `/api/community/share` | Share a project |

### **System**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |
| GET | `/api/config` | System configuration |

---

## 📁 Project Structure
```
rutgers-makerspace/
├── frontend/                    # React application
│   ├── src/
│   │   ├── pages/              # Page components (Dashboard, Login, etc.)
│   │   ├── components/         # Reusable UI components
│   │   ├── contexts/           # React Context providers
│   │   ├── firebase/           # Firebase configuration
│   │   └── utils/              # Helper functions
│   ├── public/                 # Static assets
│   └── package.json
│
├── api/                         # Express.js backend
│   ├── src/
│   │   ├── routes/             # API route definitions
│   │   ├── controllers/        # Business logic
│   │   ├── models/             # Data models
│   │   ├── services/           # External service integrations
│   │   └── middleware/         # Custom middleware
│   └── package.json
│
├── setup.sh                     # Automated setup script
├── start-demo.sh                # Quick start script
├── start-all.sh                 # Start both services
└── README.md                    # This file
```

---

## 🎯 Use Cases

### For Students
- Submit print requests with AI-guided material selection
- Track project progress and costs
- Learn from community-shared projects
- Build portfolio of completed prints

### For Faculty
- Manage classroom printing needs
- Monitor departmental print usage and costs
- Share educational resources with students
- Access priority printing services

### For Makerspace Staff
- Efficient queue management
- Real-time printer utilization tracking
- User activity monitoring
- Automated cost recovery

---

## 🔐 Security Features

- **Authentication**: Firebase-powered secure authentication with multiple providers
- **Authorization**: Protected API endpoints with token verification
- **Data Privacy**: User data isolation and secure storage
- **Input Validation**: Comprehensive sanitization of all user inputs
- **Rate Limiting**: Protection against abuse and DOS attacks
- **Audit Logging**: Complete request/response logging for compliance

---

## 🚀 Deployment Options

### **Development**
```bash
./start-all.sh  # Local development with hot reload
```

### **Production**
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: Deploy to AWS EC2, Google Cloud Run, or Heroku
- **Database**: Connect to Snowflake or PostgreSQL for persistence
- **CI/CD**: GitHub Actions workflow included for automated deployment

---

## 📈 Future Enhancements

- [ ] Mobile applications (iOS/Android)
- [ ] Real-time printer status monitoring with IoT integration
- [ ] Advanced analytics dashboard with data visualization
- [ ] Multi-language support for international users
- [ ] Integration with CAD software for direct uploads
- [ ] Machine learning for print failure prediction
- [ ] Automated print scheduling optimization

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👥 Team

Built with ❤️ for HackRU 2025

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <sub>Made with passion at Rutgers University • HackRU 2025</sub>
</div>
