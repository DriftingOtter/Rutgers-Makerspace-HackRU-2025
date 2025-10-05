#!/usr/bin/env node

/**
 * Rutgers Makerspace Database Integration Script
 * This script updates the existing API to use the new Snowflake database
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// Check if .env file exists
function checkEnvFile() {
    const envPath = path.join(__dirname, 'api', '.env');
    if (!fs.existsSync(envPath)) {
        logError('No .env file found in api directory.');
        logInfo('Please run ./setup-database-only.sh first to configure the database connection.');
        return false;
    }
    return true;
}

// Install required dependencies
function installDependencies() {
    logInfo('Installing required dependencies...');
    
    const dependencies = [
        'snowflake-sdk',
        'uuid',
        'dotenv'
    ];
    
    const apiPackageJsonPath = path.join(__dirname, 'api', 'package.json');
    const apiPackageJson = JSON.parse(fs.readFileSync(apiPackageJsonPath, 'utf8'));
    
    let updated = false;
    dependencies.forEach(dep => {
        if (!apiPackageJson.dependencies[dep]) {
            apiPackageJson.dependencies[dep] = '^1.0.0';
            updated = true;
            logInfo(`Added ${dep} to dependencies`);
        }
    });
    
    if (updated) {
        fs.writeFileSync(apiPackageJsonPath, JSON.stringify(apiPackageJson, null, 2));
        logSuccess('Updated package.json with required dependencies');
        
        // Install dependencies
        const { execSync } = require('child_process');
        try {
            execSync('cd api && npm install', { stdio: 'inherit' });
            logSuccess('Dependencies installed successfully');
        } catch (err) {
            logError('Failed to install dependencies. Please run "cd api && npm install" manually.');
        }
    } else {
        logInfo('All required dependencies are already installed');
    }
}

// Create database integration files
function createIntegrationFiles() {
    logInfo('Creating database integration files...');
    
    // Create database directory if it doesn't exist
    const dbDir = path.join(__dirname, 'api', 'src', 'database');
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Create database connection file
    const dbConnectionPath = path.join(dbDir, 'connection.js');
    if (!fs.existsSync(dbConnectionPath)) {
        const dbConnectionContent = `/**
 * Database Connection Manager
 * This file manages the database connection and provides a singleton instance
 */

const { connectionPool, healthCheck, closeConnections } = require('./snowflake');

class DatabaseConnection {
    constructor() {
        this.pool = connectionPool;
    }

    async getConnection() {
        return new Promise((resolve, reject) => {
            this.pool.use((connection) => {
                resolve(connection);
            });
        });
    }

    async healthCheck() {
        return await healthCheck();
    }

    async close() {
        await closeConnections();
    }
}

module.exports = new DatabaseConnection();
`;
        
        fs.writeFileSync(dbConnectionPath, dbConnectionContent);
        logSuccess('Created database connection manager');
    }
    
    // Create database middleware
    const dbMiddlewarePath = path.join(__dirname, 'api', 'src', 'middleware', 'database.js');
    if (!fs.existsSync(dbMiddlewarePath)) {
        const dbMiddlewareContent = `/**
 * Database Middleware
 * This middleware provides database access to all routes
 */

const db = require('../database/snowflake');

const databaseMiddleware = (req, res, next) => {
    req.db = db;
    next();
};

module.exports = databaseMiddleware;
`;
        
        fs.writeFileSync(dbMiddlewarePath, dbMiddlewareContent);
        logSuccess('Created database middleware');
    }
}

// Update existing API routes
function updateApiRoutes() {
    logInfo('Updating API routes to use database...');
    
    // Update print request routes
    const printRequestRoutePath = path.join(__dirname, 'api', 'src', 'routes', 'printRequest.js');
    if (fs.existsSync(printRequestRoutePath)) {
        let content = fs.readFileSync(printRequestRoutePath, 'utf8');
        
        // Add database import
        if (!content.includes('const db = require(\'../database/snowflake\');')) {
            content = content.replace(
                'const express = require(\'express\');',
                'const express = require(\'express\');\nconst db = require(\'../database/snowflake\');'
            );
        }
        
        // Update the print request creation endpoint
        const newPrintRequestHandler = `
// Create a new print request
router.post('/',
    requestLogger,
    asyncHandler(async (req, res) => {
        try {
            const requestData = {
                userId: req.user?.uid || 'anonymous',
                projectName: req.body.projectName,
                description: req.body.description,
                material: req.body.material,
                color: req.body.color,
                quantity: parseInt(req.body.quantity) || 1,
                urgency: req.body.urgency || 'normal',
                specialInstructions: req.body.specialInstructions,
                fileName: req.file?.originalname,
                fileSize: req.file?.size,
                fileType: req.file?.mimetype?.split('/')[1],
                fileUrl: req.file?.path,
                modelUrl: null, // Will be set when 3D model is processed
                fallbackImageUrl: null // Will be set with random image
            };

            const requestId = await db.PrintRequestRepository.createPrintRequest(requestData);
            
            res.status(201).json({
                status: 'success',
                data: {
                    requestId: requestId,
                    message: 'Print request created successfully'
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error creating print request:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create print request',
                error: error.message
            });
        }
    })
);`;

        // Replace the existing POST route
        content = content.replace(
            /router\.post\('\/',[\s\S]*?}\)\)\);/,
            newPrintRequestHandler
        );
        
        // Update user print requests endpoint
        const userPrintRequestsHandler = `
// Get user's print requests
router.get('/user/print-requests',
    requestLogger,
    asyncHandler(async (req, res) => {
        try {
            const userId = req.user?.uid || 'anonymous';
            const requests = await db.PrintRequestRepository.getPrintRequestsByUserId(userId);
            
            res.status(200).json({
                status: 'success',
                data: requests,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching user print requests:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch print requests',
                error: error.message
            });
        }
    })
);`;

        // Replace the existing user print requests route
        content = content.replace(
            /router\.get\('\/user\/print-requests',[\s\S]*?}\)\)\);/,
            userPrintRequestsHandler
        );
        
        // Update community print requests endpoint
        const communityPrintRequestsHandler = `
// Get community print requests
router.get('/community/print-requests',
    requestLogger,
    asyncHandler(async (req, res) => {
        try {
            const projects = await db.CommunityRepository.getPublicProjects();
            
            res.status(200).json({
                status: 'success',
                data: projects,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching community projects:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch community projects',
                error: error.message
            });
        }
    })
);`;

        // Replace the existing community print requests route
        content = content.replace(
            /router\.get\('\/community\/print-requests',[\s\S]*?}\)\)\);/,
            communityPrintRequestsHandler
        );
        
        fs.writeFileSync(printRequestRoutePath, content);
        logSuccess('Updated print request routes');
    }
}

// Create health check endpoint
function createHealthCheckEndpoint() {
    logInfo('Creating health check endpoint...');
    
    const healthCheckPath = path.join(__dirname, 'api', 'src', 'routes', 'health.js');
    if (!fs.existsSync(healthCheckPath)) {
        const healthCheckContent = `/**
 * Health Check Routes
 * These routes provide system health information
 */

const express = require('express');
const router = express.Router();
const db = require('../database/snowflake');

// Basic health check
router.get('/', async (req, res) => {
    try {
        const dbHealth = await db.healthCheck();
        
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            database: dbHealth
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Database health check
router.get('/database', async (req, res) => {
    try {
        const dbHealth = await db.healthCheck();
        res.status(200).json(dbHealth);
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

module.exports = router;
`;
        
        fs.writeFileSync(healthCheckPath, healthCheckContent);
        logSuccess('Created health check endpoint');
    }
}

// Update main app.js to include database middleware
function updateMainApp() {
    logInfo('Updating main app.js...');
    
    const appPath = path.join(__dirname, 'api', 'src', 'app.js');
    if (fs.existsSync(appPath)) {
        let content = fs.readFileSync(appPath, 'utf8');
        
        // Add database middleware import
        if (!content.includes('const databaseMiddleware = require(\'./middleware/database\');')) {
            content = content.replace(
                'const express = require(\'express\');',
                'const express = require(\'express\');\nconst databaseMiddleware = require(\'./middleware/database\');'
            );
        }
        
        // Add database middleware to app
        if (!content.includes('app.use(databaseMiddleware);')) {
            content = content.replace(
                'app.use(express.json());',
                'app.use(express.json());\napp.use(databaseMiddleware);'
            );
        }
        
        // Add health check route
        if (!content.includes('const healthRoutes = require(\'./routes/health\');')) {
            content = content.replace(
                'const printRequestRoutes = require(\'./routes/printRequest\');',
                'const printRequestRoutes = require(\'./routes/printRequest\');\nconst healthRoutes = require(\'./routes/health\');'
            );
        }
        
        if (!content.includes('app.use(\'/api/health\', healthRoutes);')) {
            content = content.replace(
                'app.use(\'/api/print-request\', printRequestRoutes);',
                'app.use(\'/api/print-request\', printRequestRoutes);\napp.use(\'/api/health\', healthRoutes);'
            );
        }
        
        fs.writeFileSync(appPath, content);
        logSuccess('Updated main app.js');
    }
}

// Main integration function
function main() {
    log('🚀 Starting Rutgers Makerspace Database Integration', 'cyan');
    log('=' .repeat(60), 'cyan');
    
    try {
        // Check prerequisites
        if (!checkEnvFile()) {
            process.exit(1);
        }
        
        // Install dependencies
        installDependencies();
        
        // Create integration files
        createIntegrationFiles();
        
        // Update API routes
        updateApiRoutes();
        
        // Create health check endpoint
        createHealthCheckEndpoint();
        
        // Update main app
        updateMainApp();
        
        log('=' .repeat(60), 'cyan');
        logSuccess('Database integration completed successfully! 🎉');
        logInfo('Your API is now configured to use the Snowflake database.');
        logInfo('Next steps:');
        logInfo('1. Test the database connection: node test-database-connection.js');
        logInfo('2. Start the API server: cd api && npm start');
        logInfo('3. Test the endpoints: curl http://localhost:8080/api/health');
        
    } catch (err) {
        logError(`Integration failed: ${err.message}`);
        process.exit(1);
    }
}

// Run integration if this script is executed directly
if (require.main === module) {
    main();
}

module.exports = { main };