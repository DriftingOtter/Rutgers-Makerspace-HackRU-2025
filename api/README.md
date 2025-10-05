# Rutgers Makerspace Smart 3D Printing API

A production-grade Node.js API that integrates with Google Gemini AI to provide intelligent 3D printing recommendations for Rutgers Makerspace users.

> **Note**: This API is part of the Rutgers Makerspace HackRU 2025 project. The main project repository is located in the parent directory.

## 🚀 Features

### 🤖 AI-Powered Analysis
- **Google Gemini Integration**: Analyzes project descriptions and images
- **Intelligent Material Selection**: Recommends optimal materials based on project requirements
- **Smart Printer Selection**: Chooses the best printer based on material compatibility and project needs
- **Automated Print Settings**: Optimizes layer height, infill, supports, and other parameters
- **Accurate Cost Calculation**: Provides detailed pricing based on Rutgers Makerspace rates

### 🔐 User Management & Community
- **User Print History**: Track individual user print requests
- **Community Sharing**: Public print request sharing and collaboration
- **Account Management**: User statistics and request tracking
- **Protected Endpoints**: Secure API access with authentication

### 🛡️ Security & Reliability
- **Comprehensive Validation**: Input validation and sanitization for security
- **Professional Logging**: Structured logging with Winston for monitoring and debugging
- **Error Handling**: Robust error handling with user-friendly messages
- **Rate Limiting**: Prevents abuse and ensures fair usage

## 🏗️ Architecture

The API follows a layered architecture with clear separation of concerns:

```
src/
├── models/           # Core business logic classes
│   ├── PrintRequest.js
│   ├── PrinterSelector.js
│   ├── MaterialAdvisor.js
│   └── PrintSettingsOptimizer.js
├── services/         # External service integrations
│   ├── GeminiAdapter.js
│   └── PricingEngine.js
├── controllers/      # Request orchestration
│   └── PrintRequestController.js
├── routes/           # Express route definitions
│   └── printRequest.js
├── middleware/       # Custom middleware
│   ├── validation.js
│   └── errorHandler.js
├── config/          # Configuration files
│   ├── printers.json
│   └── pricing.json
└── utils/           # Utility functions
    └── logger.js
```

## 🛠️ Installation

1. **Navigate to the API directory**
   ```bash
   cd api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   DEBUG=true
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### 🔐 Authentication & User Management
- `GET /api/user/print-requests` - Get user's print request history
- `GET /api/community/print-requests` - Get public community requests

### 🖨️ 3D Printing Core
- `POST /api/print-request` - Process 3D printing request with AI analysis
- `GET /api/materials` - Get available materials and their properties
- `GET /api/printers` - Get available printers and their capabilities
- `GET /api/pricing` - Get pricing information for materials and services
- `POST /api/estimate-cost` - Get cost estimate for a project

### 🔧 System
- `GET /api/health` - Health check endpoint with service status
- `GET /api/config` - Get API configuration and capabilities

### Example: Process Print Request
**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "netID": "jd567",
  "email": "jd567@rutgers.edu",
  "phone": "555-123-4567",
  "projectDescription": "Ergonomic tool handle for mechanical assembly line prototype",
  "fileLink": "https://drive.google.com/file/handle.obj",
  "preferredMaterial": "PETG",
  "preferredColor": "Grey",
  "renderImages": ["handle_front.png", "handle_side.png"]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "requestId": "REQ_1234567890_abc12",
    "recommendations": {
      "recommendedPrinter": "Bambu Lab X1 Carbon Combo",
      "recommendedMaterial": "PETG",
      "recommendedColor": "Grey",
      "printSettings": {
        "layerHeight": "0.2mm",
        "infill": "50%",
        "supports": true,
        "nozzleTemp": "245C",
        "bedTemp": "80C",
        "printSpeed": "60mm/s"
      },
      "estimatedCost": "$3.80",
      "estimatedPrintTime": "2.5 hours"
    },
    "reasoning": {
      "material": "Chosen PETG for strength and temperature resistance",
      "printer": "Bambu Lab X1 Carbon supports large volume and reinforced polymers",
      "settings": "Optimized for functional parts with medium infill"
    }
  }
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |
| `DEBUG` | Enable debug logging | false |
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `GEMINI_API_URL` | Gemini API endpoint | Required |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | info |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

### Printer Configuration

Edit `src/config/printers.json` to add or modify printers:

```json
{
  "printers": [
    {
      "id": "bambu-x1-carbon",
      "name": "Bambu Lab X1 Carbon Combo",
      "manufacturer": "Bambu Lab",
      "type": "FDM",
      "maxBuildVolume": { "x": 256, "y": 256, "z": 256 },
      "supportedMaterials": ["PLA", "PETG", "ABS", "TPU"],
      "hourlyRate": 2.50
    }
  ]
}
```

### Pricing Configuration

Edit `src/config/pricing.json` to update material costs and pricing rules.

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

## 📊 Monitoring

The API includes comprehensive logging and monitoring:

- **Request Logging**: All API requests are logged with timing and status
- **Error Logging**: Detailed error logs with stack traces
- **Performance Metrics**: Request duration and system performance
- **Security Events**: Authentication and authorization events

Logs are stored in the `logs/` directory:
- `error.log` - Error-level logs
- `combined.log` - All logs
- `access.log` - API access logs
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

## 🔒 Security

The API implements several security measures:

- **Input Validation**: Comprehensive validation using Joi schemas
- **Input Sanitization**: XSS protection and data sanitization
- **Rate Limiting**: Prevents abuse and DoS attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet.js**: Security headers and protection
- **Error Handling**: Secure error messages without sensitive data

## 🚀 Deployment

### Production Deployment

1. **Set production environment variables**
2. **Install production dependencies**
   ```bash
   npm ci --production
   ```
3. **Start with PM2 or similar process manager**
   ```bash
   pm2 start src/app.js --name makerspace-api
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the Rutgers Makerspace team
- Check the API documentation at `/api/config`

## 🔮 Future Enhancements

- [ ] File upload support for STL/OBJ files
- [ ] Real-time print status tracking
- [ ] Integration with Rutgers authentication system
- [ ] Advanced AI model analysis
- [ ] Mobile app integration
- [ ] Print queue management
- [ ] Material inventory tracking