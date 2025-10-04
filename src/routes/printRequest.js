const express = require('express');
const PrintRequestController = require('../controllers/PrintRequestController');
const { validatePrintRequest, validateQueryParams, sanitizeInput } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { requestLogger } = require('../middleware/errorHandler');

const router = express.Router();

// Initialize controller with configuration
const controller = new PrintRequestController({
    geminiApiKey: process.env.GEMINI_API_KEY,
    geminiApiUrl: process.env.GEMINI_API_URL,
    debugMode: process.env.DEBUG === 'true'
});

/**
 * @route POST /api/print-request
 * @description Process a 3D printing request with AI analysis
 * @access Public (with validation)
 */
router.post('/print-request', 
    requestLogger,
    sanitizeInput,
    validatePrintRequest,
    validateQueryParams,
    asyncHandler(async (req, res) => {
        try {
            const result = await controller.processPrintRequest(req.body);
            res.status(200).json(result);
        } catch (error) {
            // Error will be handled by errorHandler middleware
            throw error;
        }
    })
);

/**
 * @route GET /api/health
 * @description Health check endpoint
 * @access Public
 */
router.get('/health', 
    requestLogger,
    asyncHandler(async (req, res) => {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        };

        // Test controller configuration
        try {
            const configTest = await controller.testConfiguration();
            healthStatus.services = configTest;
            healthStatus.overallHealth = Object.values(configTest).every(status => status === true);
        } catch (error) {
            healthStatus.services = { error: 'Configuration test failed' };
            healthStatus.overallHealth = false;
        }

        const statusCode = healthStatus.overallHealth ? 200 : 503;
        res.status(statusCode).json(healthStatus);
    })
);

/**
 * @route GET /api/materials
 * @description Get available materials and their properties
 * @access Public
 */
router.get('/materials',
    requestLogger,
    validateQueryParams,
    asyncHandler(async (req, res) => {
        try {
            const MaterialAdvisor = require('../models/MaterialAdvisor');
            const materialAdvisor = new MaterialAdvisor(process.env.DEBUG === 'true');
            
            const materials = materialAdvisor.getAllMaterials();
            const materialsWithInfo = materials.map(material => 
                materialAdvisor.getMaterialInfo(material)
            );

            res.status(200).json({
                status: 'success',
                data: {
                    materials: materialsWithInfo,
                    count: materialsWithInfo.length
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            throw error;
        }
    })
);

/**
 * @route GET /api/printers
 * @description Get available printers and their capabilities
 * @access Public
 */
router.get('/printers',
    requestLogger,
    validateQueryParams,
    asyncHandler(async (req, res) => {
        try {
            const PrinterSelector = require('../models/PrinterSelector');
            const printerSelector = new PrinterSelector(process.env.DEBUG === 'true');
            
            const printers = printerSelector.getAvailablePrinters();

            res.status(200).json({
                status: 'success',
                data: {
                    printers: printers,
                    count: printers.length
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            throw error;
        }
    })
);

/**
 * @route GET /api/pricing
 * @description Get pricing information for materials
 * @access Public
 */
router.get('/pricing',
    requestLogger,
    validateQueryParams,
    asyncHandler(async (req, res) => {
        try {
            const PricingEngine = require('../services/PricingEngine');
            const pricingEngine = new PricingEngine({}, process.env.DEBUG === 'true');
            
            const materialsWithPricing = pricingEngine.getAllMaterialsWithPricing();
            const pricingConfig = pricingEngine.getPricingConfiguration();

            res.status(200).json({
                status: 'success',
                data: {
                    materials: materialsWithPricing,
                    pricingRules: pricingConfig,
                    count: materialsWithPricing.length
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            throw error;
        }
    })
);

/**
 * @route POST /api/estimate-cost
 * @description Get cost estimate for a project without full processing
 * @access Public
 */
router.post('/estimate-cost',
    requestLogger,
    sanitizeInput,
    asyncHandler(async (req, res) => {
        try {
            const { material, complexity = 'medium', sizeCategory = 'medium' } = req.body;
            
            if (!material) {
                return res.status(422).json({
                    status: 'error',
                    message: 'Material is required for cost estimation',
                    code: 422,
                    timestamp: new Date().toISOString()
                });
            }

            const PricingEngine = require('../services/PricingEngine');
            const pricingEngine = new PricingEngine({}, process.env.DEBUG === 'true');
            
            const costEstimate = pricingEngine.estimateCostRange(material, complexity, sizeCategory);

            res.status(200).json({
                status: 'success',
                data: costEstimate,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            throw error;
        }
    })
);

/**
 * @route GET /api/config
 * @description Get API configuration and capabilities
 * @access Public
 */
router.get('/config',
    requestLogger,
    asyncHandler(async (req, res) => {
        try {
            const config = {
                api: {
                    name: 'Rutgers Makerspace 3D Printing API',
                    version: '1.0.0',
                    description: 'Smart 3D printing API with Gemini AI integration',
                    endpoints: [
                        'POST /api/print-request - Process 3D printing request',
                        'GET /api/materials - Get available materials',
                        'GET /api/printers - Get available printers',
                        'GET /api/pricing - Get pricing information',
                        'POST /api/estimate-cost - Get cost estimate',
                        'GET /api/health - Health check',
                        'GET /api/config - This configuration'
                    ]
                },
                features: {
                    aiAnalysis: true,
                    materialRecommendation: true,
                    printerSelection: true,
                    costCalculation: true,
                    printSettingsOptimization: true
                },
                supportedMaterials: [
                    'PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'PC', 'PA', 
                    'Standard Resin', 'Tough Resin'
                ],
                supportedFileTypes: ['STL', 'OBJ'],
                maxFileSize: '50MB',
                maxRenderImages: 5
            };

            res.status(200).json({
                status: 'success',
                data: config,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            throw error;
        }
    })
);

module.exports = router;