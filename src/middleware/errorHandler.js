const winston = require('winston');

/**
 * Error handling middleware for the Rutgers Makerspace 3D Printing API
 * Provides comprehensive error logging and user-friendly error responses
 */

// Configure Winston logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'makerspace-3d-printing-api' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error('API Error occurred:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Determine error type and response
    let statusCode = 500;
    let message = 'Internal server error';
    let code = 500;

    if (err.name === 'ValidationError') {
        statusCode = 422;
        message = 'Validation error';
        code = 422;
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid data format';
        code = 400;
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized access';
        code = 401;
    } else if (err.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Access forbidden';
        code = 403;
    } else if (err.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Resource not found';
        code = 404;
    } else if (err.name === 'ConflictError') {
        statusCode = 409;
        message = 'Resource conflict';
        code = 409;
    } else if (err.name === 'RateLimitError') {
        statusCode = 429;
        message = 'Too many requests';
        code = 429;
    } else if (err.message.includes('timeout')) {
        statusCode = 408;
        message = 'Request timeout';
        code = 408;
    } else if (err.message.includes('ECONNREFUSED')) {
        statusCode = 503;
        message = 'Service temporarily unavailable';
        code = 503;
    }

    // Check if error message contains structured error data
    let errorResponse;
    try {
        errorResponse = JSON.parse(err.message);
        if (errorResponse.status === 'error') {
            statusCode = errorResponse.code || statusCode;
            message = errorResponse.message || message;
        }
    } catch (parseError) {
        // Error message is not JSON, use default handling
    }

    // Prepare response
    const response = {
        status: 'error',
        message: message,
        code: statusCode,
        timestamp: new Date().toISOString()
    };

    // Add additional details in development mode
    if (process.env.NODE_ENV === 'development') {
        response.details = {
            error: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method
        };
    }

    // Add request ID if available
    if (req.requestId) {
        response.requestId = req.requestId;
    }

    res.status(statusCode).json(response);
};

/**
 * Handles 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundHandler = (req, res) => {
    logger.warn('Route not found:', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    res.status(404).json({
        status: 'error',
        message: `Route ${req.method} ${req.url} not found`,
        code: 404,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
            'POST /api/print-request',
            'GET /api/health',
            'GET /api/materials',
            'GET /api/printers'
        ]
    });
};

/**
 * Handles async errors in route handlers
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Custom error classes for different error types
 */
class ValidationError extends Error {
    constructor(message, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.code = 422;
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.code = 404;
    }
}

class UnauthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedError';
        this.code = 401;
    }
}

class ForbiddenError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForbiddenError';
        this.code = 403;
    }
}

class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.code = 409;
    }
}

class RateLimitError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RateLimitError';
        this.code = 429;
    }
}

/**
 * Rate limiting error handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const rateLimitHandler = (req, res, next) => {
    const rateLimitError = new RateLimitError('Too many requests. Please try again later.');
    next(rateLimitError);
};

/**
 * Request timeout handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const timeoutHandler = (req, res, next) => {
    const timeout = setTimeout(() => {
        const timeoutError = new Error('Request timeout');
        timeoutError.name = 'TimeoutError';
        timeoutError.code = 408;
        next(timeoutError);
    }, 30000); // 30 second timeout

    req.on('close', () => {
        clearTimeout(timeout);
    });

    next();
};

/**
 * Logs successful requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Generate request ID
    req.requestId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Log request
    logger.info('Request received:', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - startTime;
        
        logger.info('Request completed:', {
            requestId: req.requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString()
        });

        originalEnd.call(this, chunk, encoding);
    };

    next();
};

/**
 * Handles uncaught exceptions
 */
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    
    // Graceful shutdown
    process.exit(1);
});

/**
 * Handles unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', {
        reason: reason,
        promise: promise,
        timestamp: new Date().toISOString()
    });
    
    // Graceful shutdown
    process.exit(1);
});

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    requestLogger,
    timeoutHandler,
    rateLimitHandler,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    RateLimitError,
    logger
};