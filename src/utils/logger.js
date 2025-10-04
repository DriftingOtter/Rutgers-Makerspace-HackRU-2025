const winston = require('winston');
const path = require('path');

/**
 * Centralized logging utility for Rutgers Makerspace 3D Printing API
 * Provides structured logging with different levels and transports
 */

// Ensure logs directory exists
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let logMessage = `${timestamp} [${level}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
            logMessage += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return logMessage;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { 
        service: 'makerspace-3d-printing-api',
        version: '1.0.0'
    },
    transports: [
        // Error log file
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            )
        }),
        
        // Combined log file
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            )
        }),
        
        // Access log file
        new winston.transports.File({
            filename: path.join(logsDir, 'access.log'),
            level: 'info',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ],
    
    // Handle exceptions
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log'),
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            )
        })
    ],
    
    // Handle rejections
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'rejections.log'),
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            )
        })
    ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
        level: process.env.LOG_LEVEL || 'debug'
    }));
}

// Custom logging methods for API-specific events
class APILogger {
    /**
     * Logs API request
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {number} duration - Request duration in ms
     */
    static logRequest(req, res, duration) {
        logger.info('API Request', {
            requestId: req.requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            contentLength: res.get('Content-Length') || 0
        });
    }

    /**
     * Logs API error
     * @param {Error} error - Error object
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    static logError(error, req, res) {
        logger.error('API Error', {
            requestId: req.requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            error: error.message,
            stack: error.stack,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
    }

    /**
     * Logs print request processing
     * @param {string} requestId - Request ID
     * @param {Object} requestData - Request data
     * @param {Object} result - Processing result
     */
    static logPrintRequest(requestId, requestData, result) {
        logger.info('Print Request Processed', {
            requestId,
            netID: requestData.netID,
            material: result.data?.recommendations?.recommendedMaterial,
            printer: result.data?.recommendations?.recommendedPrinter,
            cost: result.data?.recommendations?.estimatedCost,
            confidence: result.data?.aiAnalysis?.confidence
        });
    }

    /**
     * Logs Gemini API interaction
     * @param {string} requestId - Request ID
     * @param {Object} request - Request data
     * @param {Object} response - Response data
     * @param {number} duration - Request duration in ms
     */
    static logGeminiInteraction(requestId, request, response, duration) {
        logger.info('Gemini API Interaction', {
            requestId,
            promptLength: request.projectDescription?.length || 0,
            imageCount: request.renderImages?.length || 0,
            responseMaterial: response.recommendedMaterial,
            confidence: response.confidence,
            duration: `${duration}ms`
        });
    }

    /**
     * Logs system events
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    static logSystemEvent(event, data = {}) {
        logger.info('System Event', {
            event,
            ...data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Logs performance metrics
     * @param {string} operation - Operation name
     * @param {number} duration - Duration in ms
     * @param {Object} metadata - Additional metadata
     */
    static logPerformance(operation, duration, metadata = {}) {
        logger.info('Performance Metric', {
            operation,
            duration: `${duration}ms`,
            ...metadata,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Logs security events
     * @param {string} event - Security event
     * @param {Object} req - Express request object
     * @param {Object} details - Additional details
     */
    static logSecurityEvent(event, req, details = {}) {
        logger.warn('Security Event', {
            event,
            requestId: req.requestId,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
            method: req.method,
            ...details,
            timestamp: new Date().toISOString()
        });
    }
}

// Export both the winston logger and custom API logger
module.exports = {
    logger,
    APILogger
};