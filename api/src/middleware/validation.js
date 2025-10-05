const Joi = require('joi');

/**
 * Validation middleware for 3D printing requests
 * Validates incoming request data against defined schemas
 */

/**
 * Schema for print request validation
 */
const printRequestSchema = Joi.object({
    firstName: Joi.string()
        .min(1)
        .max(50)
        .pattern(/^[a-zA-Z\s\-']+$/)
        .required()
        .messages({
            'string.empty': 'First name is required',
            'string.min': 'First name must be at least 1 character',
            'string.max': 'First name must not exceed 50 characters',
            'string.pattern.base': 'First name contains invalid characters'
        }),

    lastName: Joi.string()
        .min(1)
        .max(50)
        .pattern(/^[a-zA-Z\s\-']+$/)
        .required()
        .messages({
            'string.empty': 'Last name is required',
            'string.min': 'Last name must be at least 1 character',
            'string.max': 'Last name must not exceed 50 characters',
            'string.pattern.base': 'Last name contains invalid characters'
        }),

    netID: Joi.string()
        .pattern(/^[a-z]{2,3}\d{2,3}$/i)
        .required()
        .messages({
            'string.empty': 'NetID is required',
            'string.pattern.base': 'NetID must be 2-3 letters followed by 2-3 digits (e.g., jd567)'
        }),

    email: Joi.string()
        .email()
        .pattern(/@rutgers\.edu$/)
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Email must be a valid email address',
            'string.pattern.base': 'Email must be a Rutgers email address (@rutgers.edu)'
        }),

    phone: Joi.string()
        .pattern(/^[\d\s\-\(\)\+]+$/)
        .min(10)
        .max(20)
        .required()
        .messages({
            'string.empty': 'Phone number is required',
            'string.pattern.base': 'Phone number contains invalid characters',
            'string.min': 'Phone number must be at least 10 digits',
            'string.max': 'Phone number must not exceed 20 characters'
        }),

    projectDescription: Joi.string()
        .min(10)
        .max(1000)
        .required()
        .messages({
            'string.empty': 'Project description is required',
            'string.min': 'Project description must be at least 10 characters',
            'string.max': 'Project description must not exceed 1000 characters'
        }),

    fileLink: Joi.string()
        .uri({ scheme: ['http', 'https'] })
        .required()
        .messages({
            'string.empty': 'File link is required',
            'string.uri': 'File link must be a valid HTTP/HTTPS URL'
        }),

    preferredMaterial: Joi.string()
        .valid('PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'PC', 'PA', 'Standard Resin', 'Tough Resin')
        .required()
        .messages({
            'string.empty': 'Preferred material is required',
            'any.only': 'Preferred material must be one of: PLA, PETG, ABS, TPU, ASA, PC, PA, Standard Resin, Tough Resin'
        }),

    preferredColor: Joi.string()
        .min(1)
        .max(30)
        .pattern(/^[a-zA-Z\s\-]+$/)
        .required()
        .messages({
            'string.empty': 'Preferred color is required',
            'string.min': 'Color must be at least 1 character',
            'string.max': 'Color must not exceed 30 characters',
            'string.pattern.base': 'Color contains invalid characters'
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