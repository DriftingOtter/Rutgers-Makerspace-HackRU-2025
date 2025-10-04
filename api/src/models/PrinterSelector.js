const printersConfig = require('../config/printers.json');

/**
 * @class PrinterSelector
 * @description Determines the best printer based on model requirements, material preferences, and availability.
 * Implements intelligent printer selection logic following Rutgers Makerspace standards.
 */
class PrinterSelector {
    #availablePrinters;
    #selectionCriteria;
    #debugMode;

    /**
     * Creates a new PrinterSelector instance
     * @param {boolean} debugMode - Enable debug logging
     */
    constructor(debugMode = false) {
        this.#availablePrinters = [...printersConfig.printers];
        this.#selectionCriteria = {
            materialCompatibility: 0.4,
            buildVolume: 0.3,
            costEfficiency: 0.2,
            quality: 0.1
        };
        this.#debugMode = debugMode;
    }

    /**
     * Selects the optimal printer for the given requirements
     * @param {string} material - Required material type
     * @param {Object} dimensions - Model dimensions {x, y, z}
     * @param {string} projectType - Type of project (prototype, functional, decorative, etc.)
     * @param {Object} preferences - User preferences and constraints
     * @returns {Object} Selected printer with reasoning
     */
    selectPrinter(material, dimensions = null, projectType = 'general', preferences = {}) {
        this.#validateInput(material, dimensions, projectType);

        const compatiblePrinters = this.#filterCompatiblePrinters(material, dimensions);
        
        if (compatiblePrinters.length === 0) {
            throw new Error(`No compatible printers found for material: ${material}`);
        }

        const scoredPrinters = this.#scorePrinters(compatiblePrinters, material, dimensions, projectType, preferences);
        const selectedPrinter = this.#selectBestPrinter(scoredPrinters);

        if (this.#debugMode) {
            console.log(`Printer selection for ${material}:`, {
                compatible: compatiblePrinters.length,
                selected: selectedPrinter.printer.name,
                score: selectedPrinter.score
            });
        }

        return {
            printer: selectedPrinter.printer,
            reasoning: selectedPrinter.reasoning,
            score: selectedPrinter.score,
            alternatives: scoredPrinters.slice(1, 3).map(p => ({
                name: p.printer.name,
                score: p.score,
                reasoning: p.reasoning
            }))
        };
    }

    /**
     * Validates input parameters
     * @private
     * @param {string} material - Material type
     * @param {Object} dimensions - Model dimensions
     * @param {string} projectType - Project type
     */
    #validateInput(material, dimensions, projectType) {
        if (!material || typeof material !== 'string') {
            throw new Error('Material must be a non-empty string.');
        }

        if (dimensions && typeof dimensions !== 'object') {
            throw new Error('Dimensions must be an object with x, y, z properties.');
        }

        if (!projectType || typeof projectType !== 'string') {
            throw new Error('Project type must be a non-empty string.');
        }
    }

    /**
     * Filters printers based on material compatibility and build volume
     * @private
     * @param {string} material - Required material
     * @param {Object} dimensions - Model dimensions
     * @returns {Array} Compatible printers
     */
    #filterCompatiblePrinters(material, dimensions) {
        return this.#availablePrinters.filter(printer => {
            // Check material compatibility
            const materialSupported = printer.supportedMaterials.includes(material);
            
            // Check build volume if dimensions provided
            let volumeCompatible = true;
            if (dimensions && dimensions.x && dimensions.y && dimensions.z) {
                volumeCompatible = (
                    dimensions.x <= printer.maxBuildVolume.x &&
                    dimensions.y <= printer.maxBuildVolume.y &&
                    dimensions.z <= printer.maxBuildVolume.z
                );
            }

            return materialSupported && volumeCompatible;
        });
    }

    /**
     * Scores printers based on multiple criteria
     * @private
     * @param {Array} printers - Compatible printers
     * @param {string} material - Required material
     * @param {Object} dimensions - Model dimensions
     * @param {string} projectType - Project type
     * @param {Object} preferences - User preferences
     * @returns {Array} Scored printers
     */
    #scorePrinters(printers, material, dimensions, projectType, preferences) {
        return printers.map(printer => {
            let score = 0;
            const reasoning = [];

            // Material compatibility score
            const materialScore = this.#calculateMaterialScore(printer, material);
            score += materialScore * this.#selectionCriteria.materialCompatibility;
            reasoning.push(`Material compatibility: ${(materialScore * 100).toFixed(1)}%`);

            // Build volume efficiency score
            const volumeScore = this.#calculateVolumeScore(printer, dimensions);
            score += volumeScore * this.#selectionCriteria.buildVolume;
            reasoning.push(`Volume efficiency: ${(volumeScore * 100).toFixed(1)}%`);

            // Cost efficiency score
            const costScore = this.#calculateCostScore(printer, projectType);
            score += costScore * this.#selectionCriteria.costEfficiency;
            reasoning.push(`Cost efficiency: ${(costScore * 100).toFixed(1)}%`);

            // Quality score
            const qualityScore = this.#calculateQualityScore(printer, projectType);
            score += qualityScore * this.#selectionCriteria.quality;
            reasoning.push(`Quality rating: ${(qualityScore * 100).toFixed(1)}%`);

            return {
                printer,
                score: Math.round(score * 100) / 100,
                reasoning: reasoning.join('; ')
            };
        }).sort((a, b) => b.score - a.score);
    }

    /**
     * Calculates material compatibility score
     * @private
     * @param {Object} printer - Printer configuration
     * @param {string} material - Required material
     * @returns {number} Score between 0 and 1
     */
    #calculateMaterialScore(printer, material) {
        // All compatible printers get full score for material compatibility
        return 1.0;
    }

    /**
     * Calculates build volume efficiency score
     * @private
     * @param {Object} printer - Printer configuration
     * @param {Object} dimensions - Model dimensions
     * @returns {number} Score between 0 and 1
     */
    #calculateVolumeScore(printer, dimensions) {
        if (!dimensions || !dimensions.x || !dimensions.y || !dimensions.z) {
            return 0.5; // Neutral score if no dimensions provided
        }

        const modelVolume = dimensions.x * dimensions.y * dimensions.z;
        const printerVolume = printer.maxBuildVolume.x * printer.maxBuildVolume.y * printer.maxBuildVolume.z;
        
        const utilization = modelVolume / printerVolume;
        
        // Prefer printers with 20-80% utilization
        if (utilization >= 0.2 && utilization <= 0.8) {
            return 1.0;
        } else if (utilization < 0.2) {
            return 0.7; // Slightly penalize oversized printers
        } else {
            return 0.3; // Heavily penalize undersized printers
        }
    }

    /**
     * Calculates cost efficiency score
     * @private
     * @param {Object} printer - Printer configuration
     * @param {string} projectType - Project type
     * @returns {number} Score between 0 and 1
     */
    #calculateCostScore(printer, projectType) {
        const hourlyRate = printer.hourlyRate;
        
        // Lower hourly rate gets higher score
        const maxRate = Math.max(...this.#availablePrinters.map(p => p.hourlyRate));
        const minRate = Math.min(...this.#availablePrinters.map(p => p.hourlyRate));
        
        if (maxRate === minRate) return 1.0;
        
        return 1 - ((hourlyRate - minRate) / (maxRate - minRate));
    }

    /**
     * Calculates quality score based on printer features and project type
     * @private
     * @param {Object} printer - Printer configuration
     * @param {string} projectType - Project type
     * @returns {number} Score between 0 and 1
     */
    #calculateQualityScore(printer, projectType) {
        let score = 0.5; // Base score
        
        // Boost score for high-quality features
        if (printer.features.includes('High-speed printing')) score += 0.1;
        if (printer.features.includes('High precision')) score += 0.1;
        if (printer.features.includes('Professional grade')) score += 0.1;
        if (printer.features.includes('Multi-color printing')) score += 0.1;
        
        // Project-specific quality requirements
        if (projectType === 'engineering' || projectType === 'functional') {
            if (printer.features.includes('Carbon fiber reinforced')) score += 0.1;
            if (printer.type === 'SLA') score += 0.2; // SLA for high detail
        }
        
        return Math.min(score, 1.0);
    }

    /**
     * Selects the best printer from scored options
     * @private
     * @param {Array} scoredPrinters - Array of scored printers
     * @returns {Object} Best printer with score and reasoning
     */
    #selectBestPrinter(scoredPrinters) {
        if (scoredPrinters.length === 0) {
            throw new Error('No printers available for selection.');
        }
        
        return scoredPrinters[0];
    }

    /**
     * Gets all available printers
     * @returns {Array} List of all printers
     */
    getAvailablePrinters() {
        return [...this.#availablePrinters];
    }

    /**
     * Gets printer by ID
     * @param {string} printerId - Printer identifier
     * @returns {Object} Printer configuration
     */
    getPrinterById(printerId) {
        const printer = this.#availablePrinters.find(p => p.id === printerId);
        if (!printer) {
            throw new Error(`Printer with ID '${printerId}' not found.`);
        }
        return printer;
    }

    /**
     * Updates selection criteria weights
     * @param {Object} criteria - New criteria weights
     */
    updateSelectionCriteria(criteria) {
        if (!criteria || typeof criteria !== 'object') {
            throw new Error('Criteria must be a valid object.');
        }
        
        const validKeys = Object.keys(this.#selectionCriteria);
        for (const [key, value] of Object.entries(criteria)) {
            if (validKeys.includes(key) && typeof value === 'number' && value >= 0 && value <= 1) {
                this.#selectionCriteria[key] = value;
            }
        }
    }
}

module.exports = PrinterSelector;