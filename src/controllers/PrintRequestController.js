const PrintRequest = require('../models/PrintRequest');
const PrinterSelector = require('../models/PrinterSelector');
const MaterialAdvisor = require('../models/MaterialAdvisor');
const PrintSettingsOptimizer = require('../models/PrintSettingsOptimizer');
const GeminiAdapter = require('../services/GeminiAdapter');
const PricingEngine = require('../services/PricingEngine');

/**
 * @class PrintRequestController
 * @description Orchestrates the complete 3D printing request workflow.
 * Handles input validation, AI analysis, printer/material selection, and cost calculation.
 */
class PrintRequestController {
    #geminiAdapter;
    #printerSelector;
    #materialAdvisor;
    #pricingEngine;
    #debugMode;

    /**
     * Creates a new PrintRequestController instance
     * @param {Object} config - Configuration object
     * @param {string} config.geminiApiKey - Gemini API key
     * @param {string} config.geminiApiUrl - Gemini API URL
     * @param {boolean} config.debugMode - Enable debug logging
     */
    constructor(config) {
        this.#validateConfig(config);
        this.#geminiAdapter = new GeminiAdapter(config.geminiApiKey, config.geminiApiUrl, config.debugMode);
        this.#printerSelector = new PrinterSelector(config.debugMode);
        this.#materialAdvisor = new MaterialAdvisor(config.debugMode);
        this.#pricingEngine = new PricingEngine({}, config.debugMode);
        this.#debugMode = config.debugMode;
    }

    /**
     * Processes a complete 3D printing request
     * @param {Object} requestData - Raw request data from API
     * @returns {Object} Complete analysis and recommendations
     */
    async processPrintRequest(requestData) {
        try {
            // Step 1: Validate and create PrintRequest object
            const printRequest = new PrintRequest(requestData);
            
            if (this.#debugMode) {
                console.log('Processing print request:', printRequest.getSummary());
            }

            // Step 2: Analyze project with Gemini AI
            const geminiAnalysis = await this.#analyzeWithGemini(printRequest);
            
            // Step 3: Get material recommendation
            const materialRecommendation = this.#getMaterialRecommendation(printRequest, geminiAnalysis);
            
            // Step 4: Select optimal printer
            const printerSelection = this.#selectOptimalPrinter(materialRecommendation.material, geminiAnalysis);
            
            // Step 5: Optimize print settings
            const printSettings = this.#optimizePrintSettings(
                materialRecommendation.material,
                printerSelection.printer,
                geminiAnalysis
            );
            
            // Step 6: Calculate pricing
            const pricing = this.#calculatePricing(
                materialRecommendation.material,
                printerSelection.printer,
                printSettings.settings,
                geminiAnalysis
            );

            // Step 7: Compile final response
            const response = this.#compileResponse(
                printRequest,
                materialRecommendation,
                printerSelection,
                printSettings,
                pricing,
                geminiAnalysis
            );

            if (this.#debugMode) {
                console.log('Print request processed successfully:', {
                    requestId: printRequest.requestId,
                    material: materialRecommendation.material,
                    printer: printerSelection.printer.name,
                    cost: pricing.total
                });
            }

            return response;

        } catch (error) {
            console.error('Error processing print request:', error.message);
            throw this.#handleProcessingError(error, requestData);
        }
    }

    /**
     * Validates configuration object
     * @private
     * @param {Object} config - Configuration object
     */
    #validateConfig(config) {
        if (!config || typeof config !== 'object') {
            throw new Error('Configuration must be a valid object.');
        }

        if (!config.geminiApiKey || typeof config.geminiApiKey !== 'string') {
            throw new Error('Gemini API key must be provided.');
        }

        if (!config.geminiApiUrl || typeof config.geminiApiUrl !== 'string') {
            throw new Error('Gemini API URL must be provided.');
        }
    }

    /**
     * Analyzes project with Gemini AI
     * @private
     * @param {PrintRequest} printRequest - Print request object
     * @returns {Object} Gemini analysis results
     */
    async #analyzeWithGemini(printRequest) {
        try {
            const analysis = await this.#geminiAdapter.analyzeProject(
                printRequest.projectDescription,
                printRequest.renderImages,
                printRequest.preferredMaterial,
                printRequest.preferredColor
            );

            return {
                ...analysis,
                modelCharacteristics: {
                    complexity: analysis.complexity,
                    supportsNeeded: analysis.supportsNeeded,
                    volumeCategory: analysis.volumeCategory,
                    estimatedVolume: this.#estimateVolumeFromCategory(analysis.volumeCategory)
                }
            };

        } catch (error) {
            console.error('Gemini analysis failed:', error.message);
            // Return fallback analysis
            return {
                recommendedMaterial: printRequest.preferredMaterial || 'PLA',
                complexity: 'medium',
                supportsNeeded: true,
                volumeCategory: 'medium',
                qualityRecommendation: 'standard',
                reasoning: 'Fallback analysis due to AI service unavailability',
                confidence: 0.5,
                modelCharacteristics: {
                    complexity: 'medium',
                    supportsNeeded: true,
                    volumeCategory: 'medium',
                    estimatedVolume: 2.0
                }
            };
        }
    }

    /**
     * Estimates volume from category
     * @private
     * @param {string} volumeCategory - Volume category
     * @returns {number} Estimated volume in cubic cm
     */
    #estimateVolumeFromCategory(volumeCategory) {
        const volumeEstimates = {
            small: 0.5,
            medium: 2.0,
            large: 8.0
        };
        return volumeEstimates[volumeCategory] || volumeEstimates.medium;
    }

    /**
     * Gets material recommendation
     * @private
     * @param {PrintRequest} printRequest - Print request object
     * @param {Object} geminiAnalysis - Gemini analysis results
     * @returns {Object} Material recommendation
     */
    #getMaterialRecommendation(printRequest, geminiAnalysis) {
        const recommendation = this.#materialAdvisor.recommendMaterial(
            printRequest.projectDescription,
            printRequest.preferredMaterial,
            this.#determineProjectType(printRequest.projectDescription),
            this.#extractRequirements(printRequest.projectDescription)
        );

        // Override with Gemini recommendation if confidence is high
        if (geminiAnalysis.confidence > 0.7) {
            recommendation.material = geminiAnalysis.recommendedMaterial;
            recommendation.reasoning = `AI-recommended ${geminiAnalysis.recommendedMaterial}: ${geminiAnalysis.reasoning}`;
        }

        return recommendation;
    }

    /**
     * Determines project type from description
     * @private
     * @param {string} description - Project description
     * @returns {string} Project type
     */
    #determineProjectType(description) {
        const desc = description.toLowerCase();
        
        if (desc.includes('prototype') || desc.includes('test')) return 'prototype';
        if (desc.includes('functional') || desc.includes('mechanical')) return 'functional';
        if (desc.includes('decorative') || desc.includes('display')) return 'decorative';
        if (desc.includes('engineering') || desc.includes('structural')) return 'engineering';
        if (desc.includes('outdoor') || desc.includes('weather')) return 'outdoor';
        
        return 'general';
    }

    /**
     * Extracts requirements from description
     * @private
     * @param {string} description - Project description
     * @returns {Object} Extracted requirements
     */
    #extractRequirements(description) {
        const desc = description.toLowerCase();
        const requirements = {};
        
        if (desc.includes('strong') || desc.includes('durable')) requirements.strength = 'high';
        if (desc.includes('flexible') || desc.includes('bend')) requirements.flexibility = 'high';
        if (desc.includes('temperature') || desc.includes('heat')) requirements.temperature = 'high';
        
        return requirements;
    }

    /**
     * Selects optimal printer
     * @private
     * @param {string} material - Selected material
     * @param {Object} geminiAnalysis - Gemini analysis results
     * @returns {Object} Printer selection results
     */
    #selectOptimalPrinter(material, geminiAnalysis) {
        const dimensions = this.#getDimensionsFromVolume(geminiAnalysis.modelCharacteristics.estimatedVolume);
        
        return this.#printerSelector.selectPrinter(
            material,
            dimensions,
            geminiAnalysis.modelCharacteristics.complexity,
            { qualityPreference: geminiAnalysis.qualityRecommendation }
        );
    }

    /**
     * Gets dimensions from volume estimate
     * @private
     * @param {number} volume - Volume in cubic cm
     * @returns {Object} Estimated dimensions
     */
    #getDimensionsFromVolume(volume) {
        // Assume roughly cubic shape
        const side = Math.cbrt(volume);
        return {
            x: side,
            y: side,
            z: side
        };
    }

    /**
     * Optimizes print settings
     * @private
     * @param {string} material - Selected material
     * @param {Object} printer - Selected printer
     * @param {Object} geminiAnalysis - Gemini analysis results
     * @returns {Object} Optimized print settings
     */
    #optimizePrintSettings(material, printer, geminiAnalysis) {
        const materialInfo = this.#materialAdvisor.getMaterialInfo(material);
        
        const optimizer = new PrintSettingsOptimizer(
            materialInfo,
            printer,
            this.#debugMode
        );

        return optimizer.optimizeSettings(
            geminiAnalysis.modelCharacteristics.complexity,
            {
                hasOverhangs: geminiAnalysis.modelCharacteristics.supportsNeeded,
                complexity: geminiAnalysis.modelCharacteristics.complexity,
                estimatedVolume: geminiAnalysis.modelCharacteristics.estimatedVolume
            },
            { speedPreference: geminiAnalysis.qualityRecommendation }
        );
    }

    /**
     * Calculates pricing
     * @private
     * @param {string} material - Selected material
     * @param {Object} printer - Selected printer
     * @param {Object} printSettings - Print settings
     * @param {Object} geminiAnalysis - Gemini analysis results
     * @returns {Object} Pricing information
     */
    #calculatePricing(material, printer, printSettings, geminiAnalysis) {
        return this.#pricingEngine.calculateCost(
            material,
            printer,
            printSettings,
            geminiAnalysis.modelCharacteristics,
            {
                supports: geminiAnalysis.modelCharacteristics.supportsNeeded,
                postProcessing: geminiAnalysis.qualityRecommendation === 'high',
                rushOrder: false // Could be added as user preference
            }
        );
    }

    /**
     * Compiles final response
     * @private
     * @param {PrintRequest} printRequest - Print request object
     * @param {Object} materialRecommendation - Material recommendation
     * @param {Object} printerSelection - Printer selection
     * @param {Object} printSettings - Print settings
     * @param {Object} pricing - Pricing information
     * @param {Object} geminiAnalysis - Gemini analysis
     * @returns {Object} Complete response
     */
    #compileResponse(printRequest, materialRecommendation, printerSelection, printSettings, pricing, geminiAnalysis) {
        return {
            status: 'success',
            data: {
                requestId: printRequest.requestId,
                timestamp: new Date().toISOString(),
                user: {
                    name: `${printRequest.firstName} ${printRequest.lastName}`,
                    netID: printRequest.netID,
                    email: printRequest.email
                },
                project: {
                    description: printRequest.projectDescription,
                    fileLink: printRequest.fileLink,
                    complexity: geminiAnalysis.complexity,
                    confidence: geminiAnalysis.confidence
                },
                recommendations: {
                    recommendedPrinter: printerSelection.printer.name,
                    recommendedMaterial: materialRecommendation.material,
                    recommendedColor: printRequest.preferredColor,
                    printSettings: printSettings.settings,
                    estimatedCost: pricing.total,
                    estimatedPrintTime: printSettings.estimatedPrintTime,
                    qualityLevel: printSettings.qualityLevel
                },
                reasoning: {
                    material: materialRecommendation.reasoning,
                    printer: printerSelection.reasoning,
                    settings: printSettings.reasoning,
                    pricing: pricing.breakdown
                },
                alternatives: {
                    materials: materialRecommendation.alternatives,
                    printers: printerSelection.alternatives
                },
                aiAnalysis: {
                    geminiReasoning: geminiAnalysis.reasoning,
                    confidence: geminiAnalysis.confidence,
                    supportsNeeded: geminiAnalysis.supportsNeeded,
                    volumeCategory: geminiAnalysis.volumeCategory
                }
            }
        };
    }

    /**
     * Handles processing errors
     * @private
     * @param {Error} error - Original error
     * @param {Object} requestData - Original request data
     * @returns {Error} Formatted error
     */
    #handleProcessingError(error, requestData) {
        const errorResponse = {
            status: 'error',
            message: error.message,
            code: this.#getErrorCode(error),
            timestamp: new Date().toISOString(),
            requestData: {
                netID: requestData.netID,
                projectDescription: requestData.projectDescription?.substring(0, 100) + '...'
            }
        };

        return new Error(JSON.stringify(errorResponse));
    }

    /**
     * Gets appropriate error code
     * @private
     * @param {Error} error - Error object
     * @returns {number} HTTP error code
     */
    #getErrorCode(error) {
        if (error.message.includes('validation') || error.message.includes('invalid')) {
            return 422;
        } else if (error.message.includes('not found') || error.message.includes('missing')) {
            return 404;
        } else {
            return 500;
        }
    }

    /**
     * Tests the controller configuration
     * @returns {Object} Test results
     */
    async testConfiguration() {
        const results = {
            geminiConnection: false,
            materialAdvisor: false,
            printerSelector: false,
            pricingEngine: false
        };

        try {
            results.geminiConnection = await this.#geminiAdapter.testConnection();
        } catch (error) {
            console.error('Gemini connection test failed:', error.message);
        }

        try {
            this.#materialAdvisor.getAllMaterials();
            results.materialAdvisor = true;
        } catch (error) {
            console.error('Material advisor test failed:', error.message);
        }

        try {
            this.#printerSelector.getAvailablePrinters();
            results.printerSelector = true;
        } catch (error) {
            console.error('Printer selector test failed:', error.message);
        }

        try {
            this.#pricingEngine.getPricingConfiguration();
            results.pricingEngine = true;
        } catch (error) {
            console.error('Pricing engine test failed:', error.message);
        }

        return results;
    }
}

module.exports = PrintRequestController;