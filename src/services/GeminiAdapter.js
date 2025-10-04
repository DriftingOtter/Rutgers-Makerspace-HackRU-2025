const { GoogleGenAI } = require('@google/genai');

/**
 * @class GeminiAdapter
 * @description Handles integration with Google Gemini API for intelligent 3D printing analysis.
 * Provides methods to analyze project descriptions, images, and generate recommendations.
 */
class GeminiAdapter {
    #genAI;
    #debugMode;
    #requestTimeout;

    /**
     * Creates a new GeminiAdapter instance
     * @param {string} apiKey - Google Gemini API key
     * @param {string} apiUrl - Gemini API endpoint URL (not used with SDK)
     * @param {boolean} debugMode - Enable debug logging
     */
    constructor(apiKey, apiUrl, debugMode = false) {
        this.#validateInput(apiKey, apiUrl);
        this.#genAI = new GoogleGenAI({ apiKey });
        this.#debugMode = debugMode;
        this.#requestTimeout = 30000; // 30 seconds
    }

    /**
     * Analyzes a 3D printing project using Gemini AI
     * @param {string} projectDescription - Description of the project
     * @param {string[]} imageUrls - Array of image URLs to analyze
     * @param {string} preferredMaterial - User's preferred material
     * @param {string} preferredColor - User's preferred color
     * @returns {Object} Gemini analysis results
     */
    async analyzeProject(projectDescription, imageUrls = [], preferredMaterial = null, preferredColor = null) {
        this.#validateAnalysisInput(projectDescription, imageUrls, preferredMaterial, preferredColor);

        try {
            const prompt = this.#buildAnalysisPrompt(projectDescription, preferredMaterial, preferredColor);
            
            if (this.#debugMode) {
                console.log('Sending request to Gemini API:', {
                    prompt: prompt.substring(0, 100) + '...',
                    imageCount: imageUrls.length
                });
            }

            const response = await this.#makeApiRequest(prompt, imageUrls);
            const analysis = this.#parseAnalysisResponse(response);

            if (this.#debugMode) {
                console.log('Gemini analysis completed:', {
                    material: analysis.recommendedMaterial,
                    complexity: analysis.complexity,
                    confidence: analysis.confidence
                });
            }

            return analysis;

        } catch (error) {
            console.error('Gemini API analysis failed:', error.message);
            return this.#getFallbackAnalysis(projectDescription, preferredMaterial);
        }
    }

    /**
     * Validates constructor input parameters
     * @private
     * @param {string} apiKey - API key
     * @param {string} apiUrl - API URL
     */
    #validateInput(apiKey, apiUrl) {
        if (!apiKey || typeof apiKey !== 'string') {
            throw new Error('API key must be a non-empty string.');
        }

        if (!apiUrl || typeof apiUrl !== 'string') {
            throw new Error('API URL must be a non-empty string.');
        }

        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(apiUrl)) {
            throw new Error('API URL must be a valid HTTP/HTTPS URL.');
        }
    }

    /**
     * Validates analysis input parameters
     * @private
     * @param {string} projectDescription - Project description
     * @param {string[]} imageUrls - Image URLs
     * @param {string} preferredMaterial - Preferred material
     * @param {string} preferredColor - Preferred color
     */
    #validateAnalysisInput(projectDescription, imageUrls, preferredMaterial, preferredColor) {
        if (!projectDescription || typeof projectDescription !== 'string') {
            throw new Error('Project description must be a non-empty string.');
        }

        if (!Array.isArray(imageUrls)) {
            throw new Error('Image URLs must be an array.');
        }

        if (preferredMaterial && typeof preferredMaterial !== 'string') {
            throw new Error('Preferred material must be a string.');
        }

        if (preferredColor && typeof preferredColor !== 'string') {
            throw new Error('Preferred color must be a string.');
        }
    }

    /**
     * Builds the analysis prompt for Gemini
     * @private
     * @param {string} projectDescription - Project description
     * @param {string} preferredMaterial - Preferred material
     * @param {string} preferredColor - Preferred color
     * @returns {string} Formatted prompt
     */
    #buildAnalysisPrompt(projectDescription, preferredMaterial, preferredColor) {
        let prompt = `Analyze this 3D printing project for Rutgers Makerspace:

Project Description: "${projectDescription}"

Please provide recommendations for:
1. Best material (PLA, PETG, ABS, TPU, ASA, PC, PA, Standard Resin, Tough Resin)
2. Project complexity (simple, medium, complex, very_complex)
3. Whether supports are likely needed (true/false)
4. Estimated print volume category (small, medium, large)
5. Recommended print quality (draft, standard, high)

Consider the user's preferences:`;

        if (preferredMaterial) {
            prompt += `\n- Preferred Material: ${preferredMaterial}`;
        }

        if (preferredColor) {
            prompt += `\n- Preferred Color: ${preferredColor}`;
        }

        prompt += `\n\nRespond in JSON format:
{
  "recommendedMaterial": "material_name",
  "complexity": "complexity_level",
  "supportsNeeded": true/false,
  "volumeCategory": "volume_size",
  "qualityRecommendation": "quality_level",
  "reasoning": "brief explanation",
  "confidence": 0.0-1.0
}`;

        return prompt;
    }


    /**
     * Makes the API request to Gemini using the SDK
     * @private
     * @param {string} prompt - Analysis prompt
     * @param {string[]} imageUrls - Image URLs (not implemented yet)
     * @returns {Object} API response
     */
    async #makeApiRequest(prompt, imageUrls = []) {
        try {
            const result = await this.#genAI.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            });

            if (!result || !result.text) {
                throw new Error('Invalid response from Gemini API');
            }

            return { text: result.text };
        } catch (error) {
            throw new Error(`Gemini API request failed: ${error.message}`);
        }
    }

    /**
     * Parses the analysis response from Gemini
     * @private
     * @param {Object} response - Gemini API response
     * @returns {Object} Parsed analysis
     */
    #parseAnalysisResponse(response) {
        try {
            const content = response.text;
            
            // Extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in Gemini response');
            }

            const analysis = JSON.parse(jsonMatch[0]);
            
            // Validate required fields
            this.#validateAnalysisResult(analysis);
            
            return analysis;

        } catch (error) {
            console.error('Failed to parse Gemini response:', error.message);
            throw new Error('Failed to parse Gemini analysis response');
        }
    }

    /**
     * Validates the analysis result from Gemini
     * @private
     * @param {Object} analysis - Analysis result
     */
    #validateAnalysisResult(analysis) {
        const requiredFields = [
            'recommendedMaterial', 'complexity', 'supportsNeeded', 
            'volumeCategory', 'qualityRecommendation', 'reasoning', 'confidence'
        ];

        for (const field of requiredFields) {
            if (!(field in analysis)) {
                throw new Error(`Missing required field in analysis: ${field}`);
            }
        }

        // Validate material
        const validMaterials = [
            'PLA', 'PETG', 'ABS', 'TPU', 'ASA', 'PC', 'PA', 
            'Standard Resin', 'Tough Resin'
        ];
        if (!validMaterials.includes(analysis.recommendedMaterial)) {
            throw new Error(`Invalid material recommendation: ${analysis.recommendedMaterial}`);
        }

        // Validate complexity
        const validComplexities = ['simple', 'medium', 'complex', 'very_complex'];
        if (!validComplexities.includes(analysis.complexity)) {
            throw new Error(`Invalid complexity level: ${analysis.complexity}`);
        }

        // Validate confidence
        if (typeof analysis.confidence !== 'number' || 
            analysis.confidence < 0 || analysis.confidence > 1) {
            throw new Error(`Invalid confidence value: ${analysis.confidence}`);
        }
    }

    /**
     * Provides fallback analysis when Gemini API fails
     * @private
     * @param {string} projectDescription - Project description
     * @param {string} preferredMaterial - Preferred material
     * @returns {Object} Fallback analysis
     */
    #getFallbackAnalysis(projectDescription, preferredMaterial) {
        const description = projectDescription.toLowerCase();
        
        // Simple heuristic-based analysis
        let material = preferredMaterial || 'PLA';
        let complexity = 'medium';
        let supportsNeeded = true;
        let volumeCategory = 'medium';
        let qualityRecommendation = 'standard';

        // Material heuristics
        if (description.includes('strong') || description.includes('durable')) {
            material = 'PETG';
        } else if (description.includes('flexible') || description.includes('soft')) {
            material = 'TPU';
        } else if (description.includes('high temperature') || description.includes('heat')) {
            material = 'ABS';
        }

        // Complexity heuristics
        if (description.includes('simple') || description.includes('basic')) {
            complexity = 'simple';
        } else if (description.includes('complex') || description.includes('detailed')) {
            complexity = 'complex';
        }

        // Volume heuristics
        if (description.includes('small') || description.includes('miniature')) {
            volumeCategory = 'small';
        } else if (description.includes('large') || description.includes('big')) {
            volumeCategory = 'large';
        }

        return {
            recommendedMaterial: material,
            complexity: complexity,
            supportsNeeded: supportsNeeded,
            volumeCategory: volumeCategory,
            qualityRecommendation: qualityRecommendation,
            reasoning: 'Fallback analysis based on description keywords',
            confidence: 0.6
        };
    }

    /**
     * Tests the connection to Gemini API
     * @returns {boolean} True if connection is successful
     */
    async testConnection() {
        try {
            const testPrompt = "Hello, please respond with 'OK' to test the connection.";
            await this.#makeApiRequest(testPrompt);
            return true;

        } catch (error) {
            console.error('Gemini API connection test failed:', error.message);
            return false;
        }
    }

    /**
     * Gets the current API configuration
     * @returns {Object} API configuration
     */
    getConfiguration() {
        return {
            debugMode: this.#debugMode,
            requestTimeout: this.#requestTimeout,
            hasApiKey: !!this.#genAI?.apiKey,
            sdkVersion: 'Google GenAI SDK'
        };
    }

    /**
     * Updates the request timeout
     * @param {number} timeout - Timeout in milliseconds
     */
    setTimeout(timeout) {
        if (typeof timeout !== 'number' || timeout <= 0) {
            throw new Error('Timeout must be a positive number.');
        }
        this.#requestTimeout = timeout;
    }
}

module.exports = GeminiAdapter;