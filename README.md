# Rutgers Makerspace HackRU 2025

This repository contains the Rutgers Makerspace project for HackRU 2025, featuring a smart 3D printing API with AI integration.

## Project Structure

```
├── api/                    # 3D Printing API Backend
│   ├── src/               # Source code
│   ├── tests/             # Test files
│   ├── logs/              # Application logs
│   ├── package.json       # Node.js dependencies
│   ├── .env               # Environment configuration
│   ├── start.sh           # Quick start script
│   └── README.md          # API documentation
├── LICENSE                # MIT License
└── README.md              # This file
```

## Quick Start

### API Backend
```bash
cd api
./start.sh
```

The API will be available at:
- **API Documentation**: http://localhost:8080/api/config
- **Health Check**: http://localhost:8080/api/health

## Features

- 🤖 **AI-Powered Analysis**: Google Gemini integration for intelligent 3D printing recommendations
- 🖨️ **Printer Management**: Support for multiple 3D printer types
- 💰 **Cost Estimation**: Real-time pricing calculations
- 📊 **Material Advisor**: Smart material recommendations based on project requirements
- 🔧 **Print Settings Optimization**: Automated print parameter suggestions

## Technology Stack

- **Backend**: Node.js, Express.js
- **AI Integration**: Google Gemini API
- **Database**: In-memory (configurable for production)
- **Logging**: Winston
- **Testing**: Jest

## Development

Each component has its own documentation:
- [API Documentation](./api/README.md)

## License

MIT License - see [LICENSE](LICENSE) file for details.