const pricingConfig = require('../config/pricing.json');

/**
 * @class MaterialAdvisor
 * @description Provides intelligent material recommendations based on project requirements,
 * user preferences, and Rutgers Makerspace material properties and pricing.
 */
class MaterialAdvisor {
    #materialDatabase;
    #pricingRules;
    #debugMode;

    /**
     * Creates a new MaterialAdvisor instance
     * @param {boolean} debugMode - Enable debug logging
     */
    constructor(debugMode = false) {
        this.#materialDatabase = { ...pricingConfig.materials };
        this.#pricingRules = { ...pricingConfig.pricingRules };
        this.#debugMode = debugMode;
    }

    /**
     * Recommends the best material for a given project
     * @param {string} projectDescription - Description of the project
     * @param {string} userPreference - User's preferred material
     * @param {string} projectType - Type of project (functional, decorative, prototype, etc.)
     * @param {Object} requirements - Specific requirements (strength, flexibility, etc.)
     * @returns {Object} Material recommendation with reasoning
     */
    recommendMaterial(projectDescription, userPreference = null, projectType = 'general', requirements = {}) {
        this.#validateInput(projectDescription, userPreference, projectType);

        const materialScores = this.#scoreMaterials(projectDescription, projectType, requirements);
        const recommendedMaterial = this.#selectBestMaterial(materialScores, userPreference);

        if (this.#debugMode) {
            console.log(`Material recommendation for '${projectType}' project:`, {
                userPreference,
                recommended: recommendedMaterial.material,
                score: recommendedMaterial.score
            });
        }

        return {
            material: recommendedMaterial.material,
            reasoning: recommendedMaterial.reasoning,
            score: recommendedMaterial.score,
            properties: this.#materialDatabase[recommendedMaterial.material].properties,
            alternatives: materialScores.slice(1, 3).map(m => ({
                material: m.material,
                score: m.score,
                reasoning: m.reasoning
            }))
        };
    }

    /**
     * Validates input parameters
     * @private
     * @param {string} projectDescription - Project description
     * @param {string} userPreference - User preference
     * @param {string} projectType - Project type
     */
    #validateInput(projectDescription, userPreference, projectType) {
        if (!projectDescription || typeof projectDescription !== 'string') {
            throw new Error('Project description must be a non-empty string.');
        }

        if (userPreference && typeof userPreference !== 'string') {
            throw new Error('User preference must be a string.');
        }

        if (!projectType || typeof projectType !== 'string') {
            throw new Error('Project type must be a non-empty string.');
        }
    }

    /**
     * Scores all materials based on project requirements
     * @private
     * @param {string} projectDescription - Project description
     * @param {string} projectType - Project type
     * @param {Object} requirements - Specific requirements
     * @returns {Array} Scored materials
     */
    #scoreMaterials(projectDescription, projectType, requirements) {
        const materials = Object.keys(this.#materialDatabase);
        
        return materials.map(material => {
            let score = 0;
            const reasoning = [];

            // Project type compatibility
            const typeScore = this.#calculateTypeCompatibility(material, projectType);
            score += typeScore * 0.4;
            reasoning.push(`Type compatibility: ${(typeScore * 100).toFixed(1)}%`);

            // Description analysis
            const descriptionScore = this.#analyzeDescription(material, projectDescription);
            score += descriptionScore * 0.3;
            reasoning.push(`Description match: ${(descriptionScore * 100).toFixed(1)}%`);

            // Requirements matching
            const requirementsScore = this.#matchRequirements(material, requirements);
            score += requirementsScore * 0.2;
            reasoning.push(`Requirements match: ${(requirementsScore * 100).toFixed(1)}%`);

            // Cost efficiency
            const costScore = this.#calculateCostEfficiency(material, projectType);
            score += costScore * 0.1;
            reasoning.push(`Cost efficiency: ${(costScore * 100).toFixed(1)}%`);

            return {
                material,
                score: Math.round(score * 100) / 100,
                reasoning: reasoning.join('; ')
            };
        }).sort((a, b) => b.score - a.score);
    }

    /**
     * Calculates project type compatibility score
     * @private
     * @param {string} material - Material name
     * @param {string} projectType - Project type
     * @returns {number} Score between 0 and 1
     */
    #calculateTypeCompatibility(material, projectType) {
        const materialData = this.#materialDatabase[material];
        const recommendedFor = materialData.recommendedFor;

        const typeMapping = {
            'prototype': ['prototyping', 'educational projects'],
            'functional': ['functional parts', 'mechanical components', 'structural components'],
            'decorative': ['decorative items'],
            'engineering': ['engineering prototypes', 'high-performance parts', 'engineering applications'],
            'outdoor': ['outdoor applications'],
            'food': ['food containers'],
            'flexible': ['phone cases', 'gaskets', 'shock absorption', 'flexible joints'],
            'high-temperature': ['high-temperature applications'],
            'chemical-resistant': ['chemical-resistant components']
        };

        const relevantTypes = typeMapping[projectType.toLowerCase()] || [];
        
        if (relevantTypes.length === 0) return 0.5; // Neutral score for unknown types

        const matches = relevantTypes.filter(type => 
            recommendedFor.some(rec => rec.toLowerCase().includes(type.toLowerCase()))
        );

        return matches.length / relevantTypes.length;
    }

    /**
     * Analyzes project description for material keywords
     * @private
     * @param {string} material - Material name
     * @param {string} description - Project description
     * @returns {number} Score between 0 and 1
     */
    #analyzeDescription(material, description) {
        const materialData = this.#materialDatabase[material];
        const descriptionLower = description.toLowerCase();
        
        let score = 0;
        let keywordCount = 0;

        // Check for strength-related keywords
        const strengthKeywords = ['strong', 'durable', 'robust', 'tough', 'structural'];
        const strengthMatches = strengthKeywords.filter(keyword => descriptionLower.includes(keyword));
        if (strengthMatches.length > 0) {
            keywordCount++;
            if (materialData.properties.strength === 'high' || materialData.properties.strength === 'very high') {
                score += 0.3;
            }
        }

        // Check for flexibility keywords
        const flexibilityKeywords = ['flexible', 'bend', 'elastic', 'soft', 'cushion'];
        const flexibilityMatches = flexibilityKeywords.filter(keyword => descriptionLower.includes(keyword));
        if (flexibilityMatches.length > 0) {
            keywordCount++;
            if (materialData.properties.flexibility === 'high' || materialData.properties.flexibility === 'very high') {
                score += 0.3;
            }
        }

        // Check for temperature keywords
        const temperatureKeywords = ['hot', 'cold', 'temperature', 'thermal', 'heat'];
        const temperatureMatches = temperatureKeywords.filter(keyword => descriptionLower.includes(keyword));
        if (temperatureMatches.length > 0) {
            keywordCount++;
            if (materialData.properties.temperatureResistance === 'high' || materialData.properties.temperatureResistance === 'very high') {
                score += 0.3;
            }
        }

        // Check for chemical resistance keywords
        const chemicalKeywords = ['chemical', 'acid', 'solvent', 'corrosion', 'resistant'];
        const chemicalMatches = chemicalKeywords.filter(keyword => descriptionLower.includes(keyword));
        if (chemicalMatches.length > 0) {
            keywordCount++;
            if (materialData.properties.chemicalResistance === 'high' || materialData.properties.chemicalResistance === 'very high') {
                score += 0.3;
            }
        }

        // Check for biodegradable keywords
        const bioKeywords = ['eco', 'green', 'sustainable', 'biodegradable', 'environment'];
        const bioMatches = bioKeywords.filter(keyword => descriptionLower.includes(keyword));
        if (bioMatches.length > 0) {
            keywordCount++;
            if (materialData.properties.biodegradable) {
                score += 0.3;
            }
        }

        return keywordCount > 0 ? score / keywordCount : 0.5;
    }

    /**
     * Matches material properties to specific requirements
     * @private
     * @param {string} material - Material name
     * @param {Object} requirements - Specific requirements
     * @returns {number} Score between 0 and 1
     */
    #matchRequirements(material, requirements) {
        if (!requirements || Object.keys(requirements).length === 0) {
            return 0.5; // Neutral score if no specific requirements
        }

        const materialData = this.#materialDatabase[material];
        let score = 0;
        let requirementCount = 0;

        for (const [requirement, value] of Object.entries(requirements)) {
            requirementCount++;
            
            switch (requirement.toLowerCase()) {
                case 'strength':
                    if (value === 'high' && (materialData.properties.strength === 'high' || materialData.properties.strength === 'very high')) {
                        score += 1;
                    } else if (value === 'medium' && materialData.properties.strength === 'medium') {
                        score += 1;
                    } else if (value === 'low' && materialData.properties.strength === 'low') {
                        score += 1;
                    }
                    break;
                    
                case 'flexibility':
                    if (value === 'high' && (materialData.properties.flexibility === 'high' || materialData.properties.flexibility === 'very high')) {
                        score += 1;
                    } else if (value === 'medium' && materialData.properties.flexibility === 'medium') {
                        score += 1;
                    } else if (value === 'low' && materialData.properties.flexibility === 'low') {
                        score += 1;
                    }
                    break;
                    
                case 'temperature':
                    if (value === 'high' && (materialData.properties.temperatureResistance === 'high' || materialData.properties.temperatureResistance === 'very high')) {
                        score += 1;
                    } else if (value === 'medium' && materialData.properties.temperatureResistance === 'medium') {
                        score += 1;
                    } else if (value === 'low' && materialData.properties.temperatureResistance === 'low') {
                        score += 1;
                    }
                    break;
            }
        }

        return requirementCount > 0 ? score / requirementCount : 0.5;
    }

    /**
     * Calculates cost efficiency score
     * @private
     * @param {string} material - Material name
     * @param {string} projectType - Project type
     * @returns {number} Score between 0 and 1
     */
    #calculateCostEfficiency(material, projectType) {
        const materialData = this.#materialDatabase[material];
        const costPerGram = materialData.costPerGram;
        
        // Get all material costs for comparison
        const allCosts = Object.values(this.#materialDatabase).map(m => m.costPerGram);
        const maxCost = Math.max(...allCosts);
        const minCost = Math.min(...allCosts);
        
        if (maxCost === minCost) return 1.0;
        
        // For prototypes and educational projects, prefer lower cost
        if (projectType.toLowerCase() === 'prototype' || projectType.toLowerCase() === 'educational') {
            return 1 - ((costPerGram - minCost) / (maxCost - minCost));
        }
        
        // For other projects, balance cost with quality
        return 0.5;
    }

    /**
     * Selects the best material considering user preference
     * @private
     * @param {Array} materialScores - Scored materials
     * @param {string} userPreference - User's preferred material
     * @returns {Object} Best material with score and reasoning
     */
    #selectBestMaterial(materialScores, userPreference) {
        if (materialScores.length === 0) {
            throw new Error('No materials available for selection.');
        }

        // If user has a preference and it's available, boost its score
        if (userPreference && this.#materialDatabase[userPreference]) {
            const preferredIndex = materialScores.findIndex(m => m.material === userPreference);
            if (preferredIndex !== -1) {
                materialScores[preferredIndex].score += 0.1; // Boost user preference
                materialScores[preferredIndex].reasoning += '; User preference bonus';
            }
        }

        // Re-sort after applying preference boost
        materialScores.sort((a, b) => b.score - a.score);
        
        return materialScores[0];
    }

    /**
     * Gets material information by name
     * @param {string} materialName - Name of the material
     * @returns {Object} Material information
     */
    getMaterialInfo(materialName) {
        if (!materialName || typeof materialName !== 'string') {
            throw new Error('Material name must be a non-empty string.');
        }

        const material = this.#materialDatabase[materialName];
        if (!material) {
            throw new Error(`Material '${materialName}' not found in database.`);
        }

        return {
            name: materialName,
            costPerGram: material.costPerGram,
            density: material.density,
            properties: { ...material.properties },
            recommendedFor: [...material.recommendedFor]
        };
    }

    /**
     * Gets all available materials
     * @returns {Array} List of all materials
     */
    getAllMaterials() {
        return Object.keys(this.#materialDatabase);
    }

    /**
     * Validates if a material is supported
     * @param {string} materialName - Name of the material
     * @returns {boolean} True if material is supported
     */
    isMaterialSupported(materialName) {
        return materialName && typeof materialName === 'string' && 
               this.#materialDatabase.hasOwnProperty(materialName);
    }
}

module.exports = MaterialAdvisor;