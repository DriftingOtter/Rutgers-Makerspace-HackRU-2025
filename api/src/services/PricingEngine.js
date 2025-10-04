const pricingConfig = require('../config/pricing.json');

/**
 * @class PricingEngine
 * @description Calculates accurate pricing for 3D printing services at Rutgers Makerspace.
 * Considers material costs, printer hourly rates, complexity, and additional services.
 */
class PricingEngine {
    #materialDatabase;
    #pricingRules;
    #printerRates;
    #debugMode;

    /**
     * Creates a new PricingEngine instance
     * @param {Object} printerRates - Printer hourly rates from PrinterSelector
     * @param {boolean} debugMode - Enable debug logging
     */
    constructor(printerRates = {}, debugMode = false) {
        this.#materialDatabase = { ...pricingConfig.materials };
        this.#pricingRules = { ...pricingConfig.pricingRules };
        this.#printerRates = { ...printerRates };
        this.#debugMode = debugMode;
    }

    /**
     * Calculates the total cost for a 3D printing job
     * @param {string} material - Printing material
     * @param {Object} printerInfo - Selected printer information
     * @param {Object} printSettings - Print settings (layer height, infill, etc.)
     * @param {Object} modelCharacteristics - Model characteristics (volume, complexity, etc.)
     * @param {Object} additionalServices - Additional services (post-processing, rush, etc.)
     * @returns {Object} Detailed cost breakdown
     */
    calculateCost(material, printerInfo, printSettings, modelCharacteristics = {}, additionalServices = {}) {
        this.#validateInput(material, printerInfo, printSettings, modelCharacteristics, additionalServices);

        const materialCost = this.#calculateMaterialCost(material, modelCharacteristics, printSettings);
        const printerCost = this.#calculatePrinterCost(printerInfo, modelCharacteristics, printSettings);
        const complexityMultiplier = this.#getComplexityMultiplier(modelCharacteristics.complexity);
        const additionalCosts = this.#calculateAdditionalCosts(additionalServices);
        
        const subtotal = (materialCost + printerCost) * complexityMultiplier;
        const total = subtotal + additionalCosts + this.#pricingRules.baseSetupFee;
        
        const finalCost = Math.max(total, this.#pricingRules.minimumCharge);

        const costBreakdown = {
            materialCost: this.#formatCurrency(materialCost),
            printerCost: this.#formatCurrency(printerCost),
            complexityMultiplier: complexityMultiplier,
            additionalCosts: this.#formatCurrency(additionalCosts),
            setupFee: this.#formatCurrency(this.#pricingRules.baseSetupFee),
            subtotal: this.#formatCurrency(subtotal),
            total: this.#formatCurrency(finalCost),
            breakdown: this.#generateDetailedBreakdown(material, printerInfo, modelCharacteristics, additionalServices)
        };

        if (this.#debugMode) {
            console.log(`Cost calculation for ${material} print:`, {
                materialCost: costBreakdown.materialCost,
                printerCost: costBreakdown.printerCost,
                total: costBreakdown.total
            });
        }

        return costBreakdown;
    }

    /**
     * Validates input parameters
     * @private
     * @param {string} material - Material name
     * @param {Object} printerInfo - Printer information
     * @param {Object} printSettings - Print settings
     * @param {Object} modelCharacteristics - Model characteristics
     * @param {Object} additionalServices - Additional services
     */
    #validateInput(material, printerInfo, printSettings, modelCharacteristics, additionalServices) {
        if (!material || typeof material !== 'string') {
            throw new Error('Material must be a non-empty string.');
        }

        if (!printerInfo || typeof printerInfo !== 'object') {
            throw new Error('Printer information must be a valid object.');
        }

        if (!printSettings || typeof printSettings !== 'object') {
            throw new Error('Print settings must be a valid object.');
        }

        if (!this.#materialDatabase[material]) {
            throw new Error(`Material '${material}' not found in pricing database.`);
        }

        if (!printerInfo.hourlyRate || typeof printerInfo.hourlyRate !== 'number') {
            throw new Error('Printer hourly rate must be a valid number.');
        }
    }

    /**
     * Calculates material cost based on volume and material properties
     * @private
     * @param {string} material - Material name
     * @param {Object} modelCharacteristics - Model characteristics
     * @param {Object} printSettings - Print settings
     * @returns {number} Material cost in dollars
     */
    #calculateMaterialCost(material, modelCharacteristics, printSettings) {
        const materialData = this.#materialDatabase[material];
        const costPerGram = materialData.costPerGram;
        const density = materialData.density;

        // Estimate material volume based on model characteristics
        let estimatedVolume = modelCharacteristics.estimatedVolume || 0.1; // Default 0.1 cubic cm
        
        // Adjust volume based on infill percentage
        const infillPercentage = this.#parseInfillPercentage(printSettings.infill);
        const adjustedVolume = estimatedVolume * (infillPercentage / 100);

        // Convert volume to weight (grams)
        const weightInGrams = adjustedVolume * density;

        // Add 10% waste factor
        const totalWeight = weightInGrams * 1.1;

        return totalWeight * costPerGram;
    }

    /**
     * Calculates printer cost based on estimated print time
     * @private
     * @param {Object} printerInfo - Printer information
     * @param {Object} modelCharacteristics - Model characteristics
     * @param {Object} printSettings - Print settings
     * @returns {number} Printer cost in dollars
     */
    #calculatePrinterCost(printerInfo, modelCharacteristics, printSettings) {
        const hourlyRate = printerInfo.hourlyRate;
        
        // Estimate print time based on model characteristics and settings
        let estimatedHours = this.#estimatePrintTime(modelCharacteristics, printSettings);
        
        // Apply printer-specific multiplier
        const multiplier = printerInfo.materialCostMultiplier || 1.0;
        
        return estimatedHours * hourlyRate * multiplier;
    }

    /**
     * Estimates print time based on model characteristics and settings
     * @private
     * @param {Object} modelCharacteristics - Model characteristics
     * @param {Object} printSettings - Print settings
     * @returns {number} Estimated print time in hours
     */
    #estimatePrintTime(modelCharacteristics, printSettings) {
        // Base time estimation (simplified)
        let baseTime = 0.5; // Base 30 minutes
        
        // Adjust for volume
        const volume = modelCharacteristics.estimatedVolume || 0.1;
        if (volume > 1) baseTime += volume * 0.3;
        if (volume > 10) baseTime += volume * 0.1;
        
        // Adjust for layer height
        const layerHeight = parseFloat(printSettings.layerHeight) || 0.2;
        const layerHeightMultiplier = 0.2 / layerHeight; // Smaller layers = more time
        baseTime *= layerHeightMultiplier;
        
        // Adjust for infill
        const infillPercentage = this.#parseInfillPercentage(printSettings.infill);
        const infillMultiplier = 1 + (infillPercentage / 100) * 0.5;
        baseTime *= infillMultiplier;
        
        // Adjust for supports
        if (printSettings.supports) {
            baseTime *= 1.3;
        }
        
        // Adjust for complexity
        const complexity = modelCharacteristics.complexity || 'medium';
        const complexityMultipliers = {
            'simple': 0.8,
            'medium': 1.0,
            'complex': 1.4,
            'very_complex': 2.0
        };
        baseTime *= complexityMultipliers[complexity] || 1.0;
        
        return Math.max(baseTime, 0.25); // Minimum 15 minutes
    }

    /**
     * Gets complexity multiplier for pricing
     * @private
     * @param {string} complexity - Complexity level
     * @returns {number} Complexity multiplier
     */
    #getComplexityMultiplier(complexity) {
        const multipliers = this.#pricingRules.complexityMultipliers;
        return multipliers[complexity] || multipliers.medium;
    }

    /**
     * Calculates additional service costs
     * @private
     * @param {Object} additionalServices - Additional services
     * @returns {number} Additional costs in dollars
     */
    #calculateAdditionalCosts(additionalServices) {
        let additionalCost = 0;
        
        if (additionalServices.supports) {
            additionalCost += 2.00; // Support material cost
        }
        
        if (additionalServices.postProcessing) {
            additionalCost *= this.#pricingRules.postProcessingMultiplier;
        }
        
        if (additionalServices.rushOrder) {
            additionalCost *= this.#pricingRules.rushOrderMultiplier;
        }
        
        return additionalCost;
    }

    /**
     * Parses infill percentage from string format
     * @private
     * @param {string} infillString - Infill string (e.g., "20%")
     * @returns {number} Infill percentage as number
     */
    #parseInfillPercentage(infillString) {
        if (!infillString || typeof infillString !== 'string') {
            return 20; // Default infill
        }
        
        const match = infillString.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 20;
    }

    /**
     * Formats currency values
     * @private
     * @param {number} amount - Amount in dollars
     * @returns {string} Formatted currency string
     */
    #formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }

    /**
     * Generates detailed cost breakdown explanation
     * @private
     * @param {string} material - Material name
     * @param {Object} printerInfo - Printer information
     * @param {Object} modelCharacteristics - Model characteristics
     * @param {Object} additionalServices - Additional services
     * @returns {string} Detailed breakdown explanation
     */
    #generateDetailedBreakdown(material, printerInfo, modelCharacteristics, additionalServices) {
        const breakdown = [];
        
        // Material breakdown
        const materialData = this.#materialDatabase[material];
        breakdown.push(`Material: ${material} at $${materialData.costPerGram}/gram`);
        
        // Printer breakdown
        breakdown.push(`Printer: ${printerInfo.name} at $${printerInfo.hourlyRate}/hour`);
        
        // Complexity breakdown
        const complexity = modelCharacteristics.complexity || 'medium';
        const complexityMultiplier = this.#getComplexityMultiplier(complexity);
        if (complexityMultiplier > 1.0) {
            breakdown.push(`Complexity multiplier: ${complexityMultiplier}x for ${complexity} project`);
        }
        
        // Additional services
        if (additionalServices.supports) {
            breakdown.push('Supports: $2.00 additional');
        }
        
        if (additionalServices.postProcessing) {
            breakdown.push(`Post-processing: ${this.#pricingRules.postProcessingMultiplier}x multiplier`);
        }
        
        if (additionalServices.rushOrder) {
            breakdown.push(`Rush order: ${this.#pricingRules.rushOrderMultiplier}x multiplier`);
        }
        
        return breakdown.join('; ');
    }

    /**
     * Gets material cost information
     * @param {string} material - Material name
     * @returns {Object} Material cost information
     */
    getMaterialCostInfo(material) {
        if (!this.#materialDatabase[material]) {
            throw new Error(`Material '${material}' not found in pricing database.`);
        }

        const materialData = this.#materialDatabase[material];
        return {
            name: material,
            costPerGram: materialData.costPerGram,
            density: materialData.density,
            properties: { ...materialData.properties },
            recommendedFor: [...materialData.recommendedFor]
        };
    }

    /**
     * Gets all available materials with pricing
     * @returns {Array} List of materials with cost information
     */
    getAllMaterialsWithPricing() {
        return Object.keys(this.#materialDatabase).map(material => ({
            name: material,
            costPerGram: this.#materialDatabase[material].costPerGram,
            density: this.#materialDatabase[material].density
        }));
    }

    /**
     * Estimates cost range for a project without full details
     * @param {string} material - Material name
     * @param {string} complexity - Project complexity
     * @param {string} sizeCategory - Size category (small, medium, large)
     * @returns {Object} Cost range estimate
     */
    estimateCostRange(material, complexity = 'medium', sizeCategory = 'medium') {
        if (!this.#materialDatabase[material]) {
            throw new Error(`Material '${material}' not found in pricing database.`);
        }

        const materialData = this.#materialDatabase[material];
        const complexityMultiplier = this.#getComplexityMultiplier(complexity);
        
        // Base estimates by size
        const sizeEstimates = {
            small: { volume: 0.5, time: 0.5 },
            medium: { volume: 2.0, time: 1.5 },
            large: { volume: 8.0, time: 4.0 }
        };
        
        const estimate = sizeEstimates[sizeCategory] || sizeEstimates.medium;
        const materialCost = estimate.volume * materialData.density * materialData.costPerGram * 1.1;
        const printerCost = estimate.time * 2.5; // Average hourly rate
        
        const baseCost = (materialCost + printerCost) * complexityMultiplier + this.#pricingRules.baseSetupFee;
        const minCost = Math.max(baseCost * 0.8, this.#pricingRules.minimumCharge);
        const maxCost = baseCost * 1.3;
        
        return {
            minCost: this.#formatCurrency(minCost),
            maxCost: this.#formatCurrency(maxCost),
            estimatedCost: this.#formatCurrency(baseCost),
            breakdown: `Based on ${sizeCategory} ${material} project with ${complexity} complexity`
        };
    }

    /**
     * Updates pricing rules
     * @param {Object} newRules - New pricing rules
     */
    updatePricingRules(newRules) {
        if (!newRules || typeof newRules !== 'object') {
            throw new Error('Pricing rules must be a valid object.');
        }
        
        this.#pricingRules = { ...this.#pricingRules, ...newRules };
    }

    /**
     * Gets current pricing configuration
     * @returns {Object} Current pricing configuration
     */
    getPricingConfiguration() {
        return {
            baseSetupFee: this.#pricingRules.baseSetupFee,
            minimumCharge: this.#pricingRules.minimumCharge,
            complexityMultipliers: { ...this.#pricingRules.complexityMultipliers },
            supportMultiplier: this.#pricingRules.supportMultiplier,
            postProcessingMultiplier: this.#pricingRules.postProcessingMultiplier,
            rushOrderMultiplier: this.#pricingRules.rushOrderMultiplier
        };
    }
}

module.exports = PricingEngine;