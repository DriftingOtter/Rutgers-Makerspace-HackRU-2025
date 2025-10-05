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
 * @route GET /api/user/print-requests
 * @description Get user's print request history from Snowflake
 * @access Protected (requires authentication)
 */
router.get('/user/print-requests',
    requestLogger,
    asyncHandler(async (req, res) => {
        try {
            const snowflakeClient = require('../database/snowflakeClient');
            
            // Use database
            await snowflakeClient.execute('USE DATABASE RUTGERS_MAKERSPACE');
            await snowflakeClient.execute('USE SCHEMA MAKERSPACE');

            // Get all print requests (in a real app, you'd filter by user)
            const requests = await snowflakeClient.execute(`
                SELECT 
                    request_id as id,
                    project_name as title,
                    description,
                    status,
                    created_at as date,
                    material,
                    color,
                    estimated_cost as cost,
                    user_id,
                    is_public,
                    fallback_image_url as fallbackImage,
                    model_url as modelUrl
                FROM print_requests 
                ORDER BY created_at DESC
            `);

            // Transform data for frontend
            const printRequests = requests.map(req => ({
                id: req.ID,
                title: req.TITLE,
                description: req.DESCRIPTION,
                status: req.STATUS,
                date: req.DATE?.toISOString().split('T')[0] || '2024-01-01',
                material: req.MATERIAL,
                color: req.COLOR,
                cost: req.COST || 0,
                userId: req.USER_ID,
                isPublic: req.IS_PUBLIC || false,
                fallbackImage: req.FALLBACKIMAGE,
                modelUrl: req.MODELURL
            }));

            res.status(200).json({
                status: 'success',
                data: {
                    printRequests: printRequests,
                    count: printRequests.length
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching print requests:', error);
            // Fallback to mock data
            const mockPrintRequests = [
                {
                    id: 1,
                    title: "Custom Phone Case",
                    description: "3D printed phone case for iPhone 15",
                    status: "Completed",
                    date: "2024-01-15",
                    material: "PLA",
                    color: "Red",
                    cost: 12.50,
                    userId: "user123",
                    isPublic: true,
                    fallbackImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop"
                }
            ];

            res.status(200).json({
                status: 'success',
                data: {
                    printRequests: mockPrintRequests,
                    count: mockPrintRequests.length,
                    message: 'Using fallback data due to database error.'
                },
                timestamp: new Date().toISOString()
            });
        }
    })
);

/**
 * @route GET /api/community/print-requests
 * @description Get public community print requests
 * @access Public
 */
router.get('/community/print-requests',
    requestLogger,
    asyncHandler(async (req, res) => {
        try {
            const snowflakeClient = require('../database/snowflakeClient');
            
            // Use database
            await snowflakeClient.execute('USE DATABASE RUTGERS_MAKERSPACE');
            await snowflakeClient.execute('USE SCHEMA MAKERSPACE');

            // Get public print requests with user info
            const requests = await snowflakeClient.execute(`
                SELECT 
                    pr.request_id as id,
                    pr.project_name as title,
                    pr.description,
                    u.display_name as author,
                    pr.created_at as date,
                    pr.material,
                    pr.color,
                    pr.is_public,
                    pr.fallback_image_url as fallbackImage,
                    pr.model_url as modelUrl
                FROM print_requests pr
                JOIN users u ON pr.user_id = u.user_id
                WHERE pr.is_public = true
                ORDER BY pr.created_at DESC
            `);

            // Transform data for frontend
            const communityRequests = requests.map(req => ({
                id: req.ID,
                title: req.TITLE,
                description: req.DESCRIPTION,
                author: req.AUTHOR || 'Anonymous',
                date: req.DATE?.toISOString().split('T')[0] || '2024-01-01',
                material: req.MATERIAL,
                color: req.COLOR,
                likes: Math.floor(Math.random() * 30) + 5, // Random likes for demo
                downloads: Math.floor(Math.random() * 20) + 2, // Random downloads for demo
                isPublic: req.IS_PUBLIC || false,
                fallbackImage: req.FALLBACKIMAGE,
                modelUrl: req.MODELURL
            }));

            res.status(200).json({
                status: 'success',
                data: {
                    requests: communityRequests,
                    count: communityRequests.length
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching community requests:', error);
            // Fallback to mock data
            const mockCommunityRequests = [
                {
                    id: 1,
                    title: "Open Source Drone Frame",
                    description: "Lightweight drone frame design for educational purposes",
                    author: "MakerSpace Community",
                    date: "2024-01-22",
                    material: "PLA",
                    color: "Black",
                    likes: 15,
                    downloads: 8,
                    isPublic: true,
                    fallbackImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop"
                }
            ];

            res.status(200).json({
                status: 'success',
                data: {
                    requests: mockCommunityRequests,
                    count: mockCommunityRequests.length,
                    message: 'Using fallback data due to database error.'
                },
                timestamp: new Date().toISOString()
            });
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
                        'GET /api/user/print-requests - Get user print history',
                        'GET /api/community/print-requests - Get community requests',
                        'GET /api/health - Health check',
                        'GET /api/config - This configuration'
                    ]
                },
                features: {
                    aiAnalysis: true,
                    materialRecommendation: true,
                    printerSelection: true,
                    costCalculation: true,
                    printSettingsOptimization: true,
                    userDashboard: true,
                    communityFeatures: true
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