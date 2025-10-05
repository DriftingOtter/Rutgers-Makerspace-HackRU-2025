const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import middleware
const { errorHandler, notFoundHandler, requestLogger } = require('./middleware/errorHandler');

// Import routes
const printRequestRoutes = require('./routes/printRequest');

// Import database client
const snowflakeClient = require('./database/snowflakeClient');

/**
 * Rutgers Makerspace Smart 3D Printing API
 * Main application entry point with Express.js configuration
 */
class MakerspaceAPI {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    /**
     * Sets up Express middleware
     */
    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));

        // CORS configuration
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
            credentials: true
        }));

        // Request logging
        if (process.env.NODE_ENV !== 'test') {
            this.app.use(morgan('combined'));
        }

        // Custom request logger
        this.app.use(requestLogger);

        // Body parsing middleware
        this.app.use(express.json({ 
            limit: '10mb',
            verify: (req, res, buf) => {
                try {
                    JSON.parse(buf);
                } catch (e) {
                    res.status(400).json({
                        status: 'error',
                        message: 'Invalid JSON payload',
                        code: 400,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }));

        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request ID middleware
        this.app.use((req, res, next) => {
            req.requestId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            res.setHeader('X-Request-ID', req.requestId);
            next();
        });

        // Rate limiting (basic implementation)
        this.app.use((req, res, next) => {
            // In production, use express-rate-limit or similar
            const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
            const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
            
            // Simple in-memory rate limiting (not suitable for production)
            if (!global.rateLimitStore) {
                global.rateLimitStore = new Map();
            }
            
            const clientId = req.ip;
            const now = Date.now();
            const windowStart = now - rateLimitWindow;
            
            // Clean old entries
            if (global.rateLimitStore.has(clientId)) {
                const requests = global.rateLimitStore.get(clientId).filter(time => time > windowStart);
                global.rateLimitStore.set(clientId, requests);
            } else {
                global.rateLimitStore.set(clientId, []);
            }
            
            const requests = global.rateLimitStore.get(clientId);
            
            if (requests.length >= rateLimitMax) {
                return res.status(429).json({
                    status: 'error',
                    message: 'Too many requests. Please try again later.',
                    code: 429,
                    retryAfter: Math.ceil(rateLimitWindow / 1000),
                    timestamp: new Date().toISOString()
                });
            }
            
            requests.push(now);
            next();
        });
    }

    /**
     * Sets up application routes
     */
    setupRoutes() {
        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                status: 'success',
                message: 'Rutgers Makerspace Smart 3D Printing API',
                version: '1.0.0',
                documentation: '/api/config',
                endpoints: [
                    'POST /api/print-request - Process 3D printing request',
                    'GET /api/materials - Get available materials',
                    'GET /api/printers - Get available printers',
                    'GET /api/pricing - Get pricing information',
                    'POST /api/estimate-cost - Get cost estimate',
                    'GET /api/health - Health check',
                    'GET /api/config - API configuration'
                ],
                timestamp: new Date().toISOString()
            });
        });

        // API routes
        this.app.use('/api', printRequestRoutes);

        // Debug endpoint (only in development)
        if (process.env.NODE_ENV === 'development') {
            this.app.get('/debug', (req, res) => {
                res.json({
                    status: 'success',
                    data: {
                        environment: process.env.NODE_ENV,
                        debug: process.env.DEBUG,
                        port: this.port,
                        uptime: process.uptime(),
                        memory: process.memoryUsage(),
                        nodeVersion: process.version,
                        platform: process.platform
                    },
                    timestamp: new Date().toISOString()
                });
            });
        }
    }

    /**
     * Sets up error handling middleware
     */
    setupErrorHandling() {
        // 404 handler for undefined routes
        this.app.use(notFoundHandler);

        // Global error handler
        this.app.use(errorHandler);
    }

    /**
     * Starts the server
     */
    async start() {
        try {
            // Initialize database connection
            console.log('🔄 Initializing database connection...');
            await snowflakeClient.connect();
            console.log('✅ Database connected successfully');
            
            // Set database context
            await snowflakeClient.execute('USE DATABASE RUTGERS_MAKERSPACE');
            await snowflakeClient.execute('USE SCHEMA MAKERSPACE');
            console.log('✅ Database context set');
            
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            console.log('⚠️  Continuing without database - some features may be limited');
        }

        // Set up periodic connection health check
        setInterval(async () => {
            try {
                if (snowflakeClient.isConnected) {
                    await snowflakeClient.checkConnection();
                }
            } catch (error) {
                console.log('🔄 Database connection health check failed, will reconnect on next query');
            }
        }, 30000); // Check every 30 seconds

        this.app.listen(this.port, () => {
            console.log(`🚀 Rutgers Makerspace 3D Printing API running on port ${this.port}`);
            console.log(`📚 API Documentation: http://localhost:${this.port}/api/config`);
            console.log(`🏥 Health Check: http://localhost:${this.port}/api/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            
            if (process.env.DEBUG === 'true') {
                console.log('🐛 Debug mode enabled');
            }
        });
    }

    /**
     * Gets the Express app instance
     * @returns {Object} Express app
     */
    getApp() {
        return this.app;
    }
}

// Create and start the application
const api = new MakerspaceAPI();

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start the server
if (require.main === module) {
    api.start();
}

module.exports = api;