const Joi = require('joi');

/**
 * Validation middleware for 3D printing requests
 * Validates incoming request data against defined schemas
 */

/**
 * Schema for print request validation
 */
const printRequestSchema = Joi.object({
    projectName: Joi.string()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Project name is required',
            'string.min': 'Project name must be at least 1 character',
            'string.max': 'Project name must not exceed 100 characters'
        }),

    description: Joi.string()
        .min(10)
        .max(1000)
        .required()
        .messages({
            'string.empty': 'Project description is required',
            'string.min': 'Project description must be at least 10 characters',
            'string.max': 'Project description must not exceed 1000 characters'
        }),

    material: Joi.string()
        .valid('PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'PC', 'PA', 'Standard Resin', 'Tough Resin', 'Any')
        .required()
        .messages({
            'string.empty': 'Material is required',
            'any.only': 'Material must be one of: PLA, PETG, ABS, TPU, ASA, PC, PA, Standard Resin, Tough Resin, Any'
        }),

    color: Joi.string()
        .min(1)
        .max(30)
        .required()
        .messages({
            'string.empty': 'Color is required',
            'string.min': 'Color must be at least 1 character',
            'string.max': 'Color must not exceed 30 characters'
        }),

    quantity: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .required()
        .messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be a whole number',
            'number.min': 'Quantity must be at least 1',
            'number.max': 'Quantity must not exceed 10'
        }),

    urgency: Joi.string()
        .valid('low', 'normal', 'high', 'urgent')
        .required()
        .messages({
            'string.empty': 'Urgency is required',
            'any.only': 'Urgency must be one of: low, normal, high, urgent'
        }),

    specialInstructions: Joi.string()
        .max(500)
        .allow('')
        .messages({
            'string.max': 'Special instructions must not exceed 500 characters'
        }),

    file: Joi.object()
        .optional()
        .messages({
            'object.base': 'File must be an object'
        }),

    userEmail: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'User email is required',
            'string.email': 'User email must be a valid email address'
        }),

    userName: Joi.string()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.empty': 'User name is required',
            'string.min': 'User name must be at least 1 character',
            'string.max': 'User name must not exceed 100 characters'
        }),

    renderImages: Joi.array()
        .items(Joi.string().uri({ scheme: ['http', 'https'] }))
        .max(5)
        .optional()
        .messages({
            'array.max': 'Maximum 5 render images allowed',
            'string.uri': 'Render image URLs must be valid HTTP/HTTPS URLs'
        })
});

/**
 * Validates print request data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const validatePrintRequest = (req, res, next) => {
    try {
        const { error, value } = printRequestSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));

            return res.status(422).json({
                status: 'error',
                message: 'Validation failed',
                code: 422,
                errors: errorDetails,
                timestamp: new Date().toISOString()
            });
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();

    } catch (validationError) {
        console.error('Validation middleware error:', validationError);
        return res.status(500).json({
            status: 'error',
            message: 'Internal validation error',
            code: 500,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Schema for query parameter validation
 */
const querySchema = Joi.object({
    debug: Joi.boolean().optional(),
    includeAlternatives: Joi.boolean().optional(),
    maxCost: Joi.number().positive().optional(),
    preferredPrinter: Joi.string().optional()
});

/**
 * Validates query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const validateQueryParams = (req, res, next) => {
    try {
        const { error, value } = querySchema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));

            return res.status(422).json({
                status: 'error',
                message: 'Invalid query parameters',
                code: 422,
                errors: errorDetails,
                timestamp: new Date().toISOString()
            });
        }

        req.query = value;
        next();

    } catch (validationError) {
        console.error('Query validation middleware error:', validationError);
        return res.status(500).json({
            status: 'error',
            message: 'Internal validation error',
            code: 500,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Validates file upload (if needed for future features)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const validateFileUpload = (req, res, next) => {
    // This would be used if we implement file upload functionality
    // For now, we only accept file links
    
    if (req.file) {
        const allowedMimeTypes = ['application/octet-stream', 'application/stl', 'model/stl'];
        const maxFileSize = 50 * 1024 * 1024; // 50MB
        
        if (!allowedMimeTypes.includes(req.file.mimetype)) {
            return res.status(422).json({
                status: 'error',
                message: 'Invalid file type. Only STL files are allowed.',
                code: 422,
                timestamp: new Date().toISOString()
            });
        }
        
        if (req.file.size > maxFileSize) {
            return res.status(422).json({
                status: 'error',
                message: 'File too large. Maximum size is 50MB.',
                code: 422,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    next();
};

/**
 * Sanitizes input data to prevent XSS attacks
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const sanitizeInput = (req, res, next) => {
    try {
        // Sanitize string fields
        const stringFields = [
            'firstName', 'lastName', 'projectDescription', 'preferredColor',
            'projectName', 'description', 'specialInstructions', 'userEmail', 'userName'
        ];
        
        // SQL injection patterns to detect and block
        const sqlInjectionPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
            /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
            /(\b(OR|AND)\s+['"]\s*=\s*['"])/gi,
            /(UNION\s+SELECT)/gi,
            /(DROP\s+TABLE)/gi,
            /(DELETE\s+FROM)/gi,
            /(INSERT\s+INTO)/gi,
            /(UPDATE\s+SET)/gi,
            /(ALTER\s+TABLE)/gi,
            /(EXEC\s*\()/gi,
            /(SCRIPT\s*\()/gi,
            /(;\s*--)/gi,
            /(;\s*\/\*)/gi,
            /(\/\*.*?\*\/)/gi,
            /(--.*$)/gm,
            /(0x[0-9a-fA-F]+)/gi,
            /(CHAR\s*\()/gi,
            /(ASCII\s*\()/gi,
            /(SUBSTRING\s*\()/gi,
            /(LEN\s*\()/gi,
            /(COUNT\s*\()/gi,
            /(SUM\s*\()/gi,
            /(AVG\s*\()/gi,
            /(MAX\s*\()/gi,
            /(MIN\s*\()/gi
        ];
        
        for (const field of stringFields) {
            if (req.body[field] && typeof req.body[field] === 'string') {
                let value = req.body[field];
                
                // Check for SQL injection patterns
                for (const pattern of sqlInjectionPatterns) {
                    if (pattern.test(value)) {
                        console.warn(`Potential SQL injection detected in field ${field}:`, value);
                        return res.status(400).json({
                            status: 'error',
                            message: 'Invalid input detected',
                            code: 400,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
                
                // Remove potentially dangerous characters
                value = value
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '')
                    .replace(/<[^>]*>/g, '') // Remove HTML tags
                    .replace(/['"]/g, '') // Remove quotes
                    .replace(/[;\\]/g, '') // Remove semicolons and backslashes
                    .trim();
                
                req.body[field] = value;
            }
        }
        
        // Sanitize query parameters
        if (req.query) {
            for (const [key, value] of Object.entries(req.query)) {
                if (typeof value === 'string') {
                    for (const pattern of sqlInjectionPatterns) {
                        if (pattern.test(value)) {
                            console.warn(`Potential SQL injection detected in query param ${key}:`, value);
                            return res.status(400).json({
                                status: 'error',
                                message: 'Invalid query parameter detected',
                                code: 400,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                }
            }
        }
        
        next();
        
    } catch (sanitizationError) {
        console.error('Input sanitization error:', sanitizationError);
        return res.status(500).json({
            status: 'error',
            message: 'Input sanitization failed',
            code: 500,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Validates API key for protected endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey) {
        return res.status(401).json({
            status: 'error',
            message: 'API key is required',
            code: 401,
            timestamp: new Date().toISOString()
        });
    }
    
    // In production, validate against database or environment variable
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
    
    if (!validApiKeys.includes(apiKey)) {
        return res.status(403).json({
            status: 'error',
            message: 'Invalid API key',
            code: 403,
            timestamp: new Date().toISOString()
        });
    }
    
    next();
};

module.exports = {
    validatePrintRequest,
    validateQueryParams,
    validateFileUpload,
    sanitizeInput,
    validateApiKey,
    printRequestSchema
};