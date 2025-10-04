/**
 * @class PrintSettingsOptimizer
 * @description Optimizes 3D printing settings based on material properties, printer capabilities,
 * and project requirements. Provides intelligent parameter recommendations for optimal print quality.
 */
class PrintSettingsOptimizer {
    #materialProperties;
    #printerCapabilities;
    #optimizationRules;
    #debugMode;

    /**
     * Creates a new PrintSettingsOptimizer instance
     * @param {Object} materialProperties - Material properties from MaterialAdvisor
     * @param {Object} printerCapabilities - Printer capabilities from PrinterSelector
     * @param {boolean} debugMode - Enable debug logging
     */
    constructor(materialProperties, printerCapabilities, debugMode = false) {
        this.#validateInput(materialProperties, printerCapabilities);
        this.#materialProperties = { ...materialProperties };
        this.#printerCapabilities = { ...printerCapabilities };
        this.#optimizationRules = this.#initializeOptimizationRules();
        this.#debugMode = debugMode;
    }

    /**
     * Optimizes print settings for the given project
     * @param {string} projectType - Type of project (functional, decorative, prototype, etc.)
     * @param {Object} modelCharacteristics - Model characteristics (size, complexity, etc.)
     * @param {Object} userPreferences - User preferences for quality vs speed
     * @returns {Object} Optimized print settings with reasoning
     */
    optimizeSettings(projectType = 'general', modelCharacteristics = {}, userPreferences = {}) {
        this.#validateOptimizationInput(projectType, modelCharacteristics, userPreferences);

        const optimizedSettings = {
            layerHeight: this.#optimizeLayerHeight(projectType, modelCharacteristics),
            infill: this.#optimizeInfill(projectType, modelCharacteristics),
            supports: this.#optimizeSupports(modelCharacteristics),
            nozzleTemp: this.#optimizeNozzleTemp(),
            bedTemp: this.#optimizeBedTemp(),
            printSpeed: this.#optimizePrintSpeed(projectType, userPreferences),
            retraction: this.#optimizeRetraction(),
            cooling: this.#optimizeCooling()
        };

        const reasoning = this.#generateReasoning(optimizedSettings, projectType, modelCharacteristics);

        if (this.#debugMode) {
            console.log(`Print settings optimization for '${projectType}' project:`, {
                layerHeight: optimizedSettings.layerHeight,
                infill: optimizedSettings.infill,
                supports: optimizedSettings.supports
            });
        }

        return {
            settings: optimizedSettings,
            reasoning: reasoning,
            qualityLevel: this.#determineQualityLevel(optimizedSettings, projectType),
            estimatedPrintTime: this.#estimatePrintTime(optimizedSettings, modelCharacteristics)
        };
    }

    /**
     * Validates constructor input parameters
     * @private
     * @param {Object} materialProperties - Material properties
     * @param {Object} printerCapabilities - Printer capabilities
     */
    #validateInput(materialProperties, printerCapabilities) {
        if (!materialProperties || typeof materialProperties !== 'object') {
            throw new Error('Material properties must be a valid object.');
        }

        if (!printerCapabilities || typeof printerCapabilities !== 'object') {
            throw new Error('Printer capabilities must be a valid object.');
        }

        if (!materialProperties.properties) {
            throw new Error('Material properties must include properties object.');
        }

        if (!printerCapabilities.defaultSettings) {
            throw new Error('Printer capabilities must include defaultSettings object.');
        }
    }

    /**
     * Validates optimization input parameters
     * @private
     * @param {string} projectType - Project type
     * @param {Object} modelCharacteristics - Model characteristics
     * @param {Object} userPreferences - User preferences
     */
    #validateOptimizationInput(projectType, modelCharacteristics, userPreferences) {
        if (!projectType || typeof projectType !== 'string') {
            throw new Error('Project type must be a non-empty string.');
        }

        if (modelCharacteristics && typeof modelCharacteristics !== 'object') {
            throw new Error('Model characteristics must be an object.');
        }

        if (userPreferences && typeof userPreferences !== 'object') {
            throw new Error('User preferences must be an object.');
        }
    }

    /**
     * Initializes optimization rules based on material and printer properties
     * @private
     * @returns {Object} Optimization rules
     */
    #initializeOptimizationRules() {
        return {
            layerHeight: {
                fine: 0.1,
                standard: 0.2,
                draft: 0.3
            },
            infill: {
                decorative: 0.1,
                prototype: 0.2,
                functional: 0.4,
                structural: 0.6
            },
            temperature: {
                pla: { nozzle: 210, bed: 60 },
                petg: { nozzle: 245, bed: 80 },
                abs: { nozzle: 250, bed: 100 },
                tpu: { nozzle: 230, bed: 50 },
                asa: { nozzle: 260, bed: 100 },
                pc: { nozzle: 280, bed: 120 },
                pa: { nozzle: 270, bed: 80 }
            },
            speed: {
                slow: 30,
                standard: 50,
                fast: 80
            }
        };
    }

    /**
     * Optimizes layer height based on project requirements
     * @private
     * @param {string} projectType - Project type
     * @param {Object} modelCharacteristics - Model characteristics
     * @returns {string} Optimized layer height
     */
    #optimizeLayerHeight(projectType, modelCharacteristics) {
        const rules = this.#optimizationRules.layerHeight;
        
        // Determine quality requirement
        if (projectType.toLowerCase() === 'decorative' || 
            projectType.toLowerCase() === 'jewelry' ||
            (modelCharacteristics.complexity && modelCharacteristics.complexity === 'high')) {
            return `${rules.fine}mm`;
        } else if (projectType.toLowerCase() === 'prototype' || 
                   projectType.toLowerCase() === 'draft') {
            return `${rules.draft}mm`;
        } else {
            return `${rules.standard}mm`;
        }
    }

    /**
     * Optimizes infill percentage based on project requirements
     * @private
     * @param {string} projectType - Project type
     * @param {Object} modelCharacteristics - Model characteristics
     * @returns {string} Optimized infill percentage
     */
    #optimizeInfill(projectType, modelCharacteristics) {
        const rules = this.#optimizationRules.infill;
        
        if (projectType.toLowerCase() === 'decorative' || 
            projectType.toLowerCase() === 'display') {
            return `${rules.decorative * 100}%`;
        } else if (projectType.toLowerCase() === 'prototype' || 
                   projectType.toLowerCase() === 'test') {
            return `${rules.prototype * 100}%`;
        } else if (projectType.toLowerCase() === 'structural' || 
                   projectType.toLowerCase() === 'load-bearing') {
            return `${rules.structural * 100}%`;
        } else {
            return `${rules.functional * 100}%`;
        }
    }

    /**
     * Determines if supports are needed
     * @private
     * @param {Object} modelCharacteristics - Model characteristics
     * @returns {boolean} Whether supports are needed
     */
    #optimizeSupports(modelCharacteristics) {
        // This would typically involve analyzing the 3D model geometry
        // For now, we'll use heuristics based on model characteristics
        
        if (modelCharacteristics.hasOverhangs === true) {
            return true;
        } else if (modelCharacteristics.hasOverhangs === false) {
            return false;
        } else {
            // Default to true for safety if unknown
            return true;
        }
    }

    /**
     * Optimizes nozzle temperature based on material properties
     * @private
     * @returns {string} Optimized nozzle temperature
     */
    #optimizeNozzleTemp() {
        const materialName = this.#materialProperties.name?.toLowerCase();
        const temperatureRules = this.#optimizationRules.temperature;
        
        if (temperatureRules[materialName]) {
            return `${temperatureRules[materialName].nozzle}C`;
        }
        
        // Fallback to printer default
        return this.#printerCapabilities.defaultSettings.nozzleTemp || '220C';
    }

    /**
     * Optimizes bed temperature based on material properties
     * @private
     * @returns {string} Optimized bed temperature
     */
    #optimizeBedTemp() {
        const materialName = this.#materialProperties.name?.toLowerCase();
        const temperatureRules = this.#optimizationRules.temperature;
        
        if (temperatureRules[materialName]) {
            return `${temperatureRules[materialName].bed}C`;
        }
        
        // Fallback to printer default
        return this.#printerCapabilities.defaultSettings.bedTemp || '60C';
    }

    /**
     * Optimizes print speed based on project type and user preferences
     * @private
     * @param {string} projectType - Project type
     * @param {Object} userPreferences - User preferences
     * @returns {string} Optimized print speed
     */
    #optimizePrintSpeed(projectType, userPreferences) {
        const speedRules = this.#optimizationRules.speed;
        
        // Check user preference first
        if (userPreferences.speedPreference) {
            switch (userPreferences.speedPreference.toLowerCase()) {
                case 'fast':
                    return `${speedRules.fast}mm/s`;
                case 'slow':
                    return `${speedRules.slow}mm/s`;
                default:
                    return `${speedRules.standard}mm/s`;
            }
        }
        
        // Determine speed based on project type
        if (projectType.toLowerCase() === 'prototype' || 
            projectType.toLowerCase() === 'draft') {
            return `${speedRules.fast}mm/s`;
        } else if (projectType.toLowerCase() === 'decorative' || 
                   projectType.toLowerCase() === 'high-quality') {
            return `${speedRules.slow}mm/s`;
        } else {
            return `${speedRules.standard}mm/s`;
        }
    }

    /**
     * Optimizes retraction settings
     * @private
     * @returns {Object} Retraction settings
     */
    #optimizeRetraction() {
        // Default retraction settings - would be customized based on material
        return {
            distance: '3mm',
            speed: '40mm/s'
        };
    }

    /**
     * Optimizes cooling settings
     * @private
     * @returns {Object} Cooling settings
     */
    #optimizeCooling() {
        const materialName = this.#materialProperties.name?.toLowerCase();
        
        // Materials that benefit from cooling
        const coolingMaterials = ['pla'];
        
        if (coolingMaterials.includes(materialName)) {
            return {
                fanSpeed: '100%',
                minLayerTime: '5s'
            };
        } else {
            return {
                fanSpeed: '50%',
                minLayerTime: '10s'
            };
        }
    }

    /**
     * Generates reasoning for the optimized settings
     * @private
     * @param {Object} settings - Optimized settings
     * @param {string} projectType - Project type
     * @param {Object} modelCharacteristics - Model characteristics
     * @returns {string} Reasoning explanation
     */
    #generateReasoning(settings, projectType, modelCharacteristics) {
        const reasons = [];
        
        // Layer height reasoning
        if (settings.layerHeight === '0.1mm') {
            reasons.push('Fine layer height for high detail and smooth surface finish');
        } else if (settings.layerHeight === '0.3mm') {
            reasons.push('Draft layer height for faster printing and prototyping');
        } else {
            reasons.push('Standard layer height balancing quality and speed');
        }
        
        // Infill reasoning
        if (settings.infill.includes('10%')) {
            reasons.push('Low infill for decorative/display purposes');
        } else if (settings.infill.includes('60%')) {
            reasons.push('High infill for structural strength and durability');
        } else {
            reasons.push('Medium infill for functional parts');
        }
        
        // Support reasoning
        if (settings.supports) {
            reasons.push('Supports enabled for overhangs and complex geometry');
        } else {
            reasons.push('No supports needed for simple geometry');
        }
        
        // Temperature reasoning
        reasons.push(`Temperature optimized for ${this.#materialProperties.name} material properties`);
        
        return reasons.join('; ');
    }

    /**
     * Determines the quality level of the optimized settings
     * @private
     * @param {Object} settings - Optimized settings
     * @param {string} projectType - Project type
     * @returns {string} Quality level
     */
    #determineQualityLevel(settings, projectType) {
        if (settings.layerHeight === '0.1mm' && settings.printSpeed.includes('30')) {
            return 'High';
        } else if (settings.layerHeight === '0.3mm' && settings.printSpeed.includes('80')) {
            return 'Draft';
        } else {
            return 'Standard';
        }
    }

    /**
     * Estimates print time based on settings and model characteristics
     * @private
     * @param {Object} settings - Optimized settings
     * @param {Object} modelCharacteristics - Model characteristics
     * @returns {string} Estimated print time
     */
    #estimatePrintTime(settings, modelCharacteristics) {
        // This is a simplified estimation - in practice, this would use
        // more sophisticated algorithms based on model volume, complexity, etc.
        
        const baseTime = modelCharacteristics.estimatedVolume ? 
            modelCharacteristics.estimatedVolume * 0.5 : 2; // hours
        
        const layerHeightMultiplier = parseFloat(settings.layerHeight) / 0.2;
        const speedMultiplier = 50 / parseInt(settings.printSpeed);
        
        const estimatedHours = baseTime * layerHeightMultiplier * speedMultiplier;
        
        if (estimatedHours < 1) {
            return `${Math.round(estimatedHours * 60)} minutes`;
        } else {
            return `${Math.round(estimatedHours * 10) / 10} hours`;
        }
    }

    /**
     * Gets default settings for the current material and printer combination
     * @returns {Object} Default print settings
     */
    getDefaultSettings() {
        return {
            layerHeight: this.#printerCapabilities.defaultSettings.layerHeight,
            infill: '20%',
            supports: true,
            nozzleTemp: this.#printerCapabilities.defaultSettings.nozzleTemp,
            bedTemp: this.#printerCapabilities.defaultSettings.bedTemp,
            printSpeed: this.#printerCapabilities.defaultSettings.printSpeed
        };
    }

    /**
     * Validates if settings are compatible with the printer
     * @param {Object} settings - Settings to validate
     * @returns {boolean} True if settings are compatible
     */
    validateSettings(settings) {
        if (!settings || typeof settings !== 'object') {
            return false;
        }

        // Check if layer height is within printer capabilities
        const layerHeight = parseFloat(settings.layerHeight);
        if (layerHeight < 0.05 || layerHeight > 0.5) {
            return false;
        }

        // Check if temperatures are reasonable
        const nozzleTemp = parseInt(settings.nozzleTemp);
        if (nozzleTemp < 150 || nozzleTemp > 300) {
            return false;
        }

        return true;
    }
}

module.exports = PrintSettingsOptimizer;