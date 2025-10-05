/**
 * @class PrintRequest
 * @description Represents a 3D printing request from a Rutgers Makerspace user.
 * Encapsulates all user input data and provides validation and accessor methods.
 */
class PrintRequest {
    #projectName;
    #description;
    #material;
    #color;
    #quantity;
    #urgency;
    #specialInstructions;
    #file;
    #userEmail;
    #userName;
    #renderImages;
    #timestamp;
    #requestId;
    #firstName;
    #lastName;
    #netID;
    #phone;
    #email;
    #projectDescription;
    #fileLink;
    #preferredMaterial;
    #preferredColor;

    /**
     * Creates a new PrintRequest instance
     * @param {Object} requestData - The request data object
     * @param {string} requestData.projectName - Project name
     * @param {string} requestData.description - Description of the project
     * @param {string} requestData.material - Preferred printing material
     * @param {string} requestData.color - Preferred color
     * @param {number} requestData.quantity - Quantity to print
     * @param {string} requestData.urgency - Urgency level
     * @param {string} requestData.specialInstructions - Special instructions
     * @param {Object} requestData.file - File object
     * @param {string} requestData.userEmail - User's email address
     * @param {string} requestData.userName - User's name
     * @param {string[]} requestData.renderImages - Array of render image URLs
     */
    constructor(requestData) {
        this.#validateInput(requestData);
        this.#projectName = requestData.projectName;
        this.#description = requestData.description;
        this.#material = requestData.material;
        this.#color = requestData.color;
        this.#quantity = parseInt(requestData.quantity) || 1;
        this.#urgency = requestData.urgency;
        this.#specialInstructions = requestData.specialInstructions || '';
        this.#file = requestData.file;
        this.#userEmail = requestData.userEmail;
        this.#userName = requestData.userName;
        this.#renderImages = Array.isArray(requestData.renderImages) ? [...requestData.renderImages] : [];
        this.#timestamp = new Date().toISOString();
        this.#requestId = this.#generateRequestId();
    }

    /**
     * Validates the input data for the PrintRequest
     * @private
     * @param {Object} requestData - The request data to validate
     * @throws {Error} If validation fails
     */
    #validateInput(requestData) {
        if (!requestData || typeof requestData !== 'object') {
            throw new Error('Request data must be a valid object.');
        }

        const requiredFields = [
            'projectName', 'description', 'material', 'color', 'quantity', 'urgency', 'userEmail', 'userName'
        ];

        for (const field of requiredFields) {
            if (!requestData[field]) {
                throw new Error(`Missing or invalid ${field}: must be provided.`);
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(requestData.userEmail)) {
            throw new Error('Invalid email format provided.');
        }

        // Validate file object
        if (!requestData.file || typeof requestData.file !== 'object') {
            throw new Error('File must be a valid file object.');
        }

        // Validate quantity
        if (isNaN(parseInt(requestData.quantity)) || parseInt(requestData.quantity) < 1) {
            throw new Error('Quantity must be a positive number.');
        }
    }

    /**
     * Generates a unique request ID
     * @private
     * @returns {string} Unique request identifier
     */
    #generateRequestId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `REQ_${timestamp}_${random}`.toUpperCase();
    }

    // Getters
    get projectName() { return this.#projectName; }
    get description() { return this.#description; }
    get material() { return this.#material; }
    get color() { return this.#color; }
    get quantity() { return this.#quantity; }
    get urgency() { return this.#urgency; }
    get specialInstructions() { return this.#specialInstructions; }
    get file() { return this.#file; }
    get userEmail() { return this.#userEmail; }
    get userName() { return this.#userName; }
    get renderImages() { return [...this.#renderImages]; }
    get timestamp() { return this.#timestamp; }
    get requestId() { return this.#requestId; }

    // Setters with validation
    set projectName(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Project name must be a non-empty string.');
        }
        this.#projectName = name;
    }

    set description(desc) {
        if (!desc || typeof desc !== 'string') {
            throw new Error('Description must be a non-empty string.');
        }
        this.#description = desc;
    }

    set userEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new Error('Invalid email format provided.');
        }
        this.#userEmail = email;
    }

    set material(material) {
        if (!material || typeof material !== 'string') {
            throw new Error('Material must be a non-empty string.');
        }
        this.#material = material;
    }

    set color(color) {
        if (!color || typeof color !== 'string') {
            throw new Error('Color must be a non-empty string.');
        }
        this.#color = color;
    }

    /**
     * Adds a render image URL to the request
     * @param {string} imageUrl - The image URL to add
     */
    addRenderImage(imageUrl) {
        if (!imageUrl || typeof imageUrl !== 'string') {
            throw new Error('Image URL must be a non-empty string.');
        }
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(imageUrl)) {
            throw new Error('Image URL must be a valid HTTP/HTTPS URL.');
        }
        this.#renderImages.push(imageUrl);
    }

    /**
     * Converts the PrintRequest to a plain object
     * @returns {Object} Plain object representation
     */
    toObject() {
        return {
            requestId: this.#requestId,
            firstName: this.#firstName,
            lastName: this.#lastName,
            netID: this.#netID,
            email: this.#email,
            phone: this.#phone,
            projectDescription: this.#projectDescription,
            fileLink: this.#fileLink,
            preferredMaterial: this.#preferredMaterial,
            preferredColor: this.#preferredColor,
            renderImages: [...this.#renderImages],
            timestamp: this.#timestamp
        };
    }

    /**
     * Creates a summary string for logging purposes
     * @returns {string} Summary of the request
     */
    getSummary() {
        return `Request ${this.#requestId}: ${this.#firstName} ${this.#lastName} (${this.#netID}) - ${this.#preferredMaterial} ${this.#preferredColor}`;
    }
}

module.exports = PrintRequest;