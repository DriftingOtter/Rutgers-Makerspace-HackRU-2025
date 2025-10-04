/**
 * @class PrintRequest
 * @description Represents a 3D printing request from a Rutgers Makerspace user.
 * Encapsulates all user input data and provides validation and accessor methods.
 */
class PrintRequest {
    #firstName;
    #lastName;
    #netID;
    #email;
    #phone;
    #projectDescription;
    #fileLink;
    #preferredMaterial;
    #preferredColor;
    #renderImages;
    #timestamp;
    #requestId;

    /**
     * Creates a new PrintRequest instance
     * @param {Object} requestData - The request data object
     * @param {string} requestData.firstName - User's first name
     * @param {string} requestData.lastName - User's last name
     * @param {string} requestData.netID - Rutgers NetID
     * @param {string} requestData.email - User's email address
     * @param {string} requestData.phone - User's phone number
     * @param {string} requestData.projectDescription - Description of the project
     * @param {string} requestData.fileLink - URL to the 3D model file
     * @param {string} requestData.preferredMaterial - Preferred printing material
     * @param {string} requestData.preferredColor - Preferred color
     * @param {string[]} requestData.renderImages - Array of render image URLs
     */
    constructor(requestData) {
        this.#validateInput(requestData);
        this.#firstName = requestData.firstName;
        this.#lastName = requestData.lastName;
        this.#netID = requestData.netID;
        this.#email = requestData.email;
        this.#phone = requestData.phone;
        this.#projectDescription = requestData.projectDescription;
        this.#fileLink = requestData.fileLink;
        this.#preferredMaterial = requestData.preferredMaterial;
        this.#preferredColor = requestData.preferredColor;
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
            'firstName', 'lastName', 'netID', 'email', 'phone',
            'projectDescription', 'fileLink', 'preferredMaterial', 'preferredColor'
        ];

        for (const field of requiredFields) {
            if (!requestData[field] || typeof requestData[field] !== 'string') {
                throw new Error(`Missing or invalid ${field}: must be a non-empty string.`);
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(requestData.email)) {
            throw new Error('Invalid email format provided.');
        }

        // Validate NetID format (Rutgers specific)
        const netIDRegex = /^[a-z]{2,3}\d{2,3}$/i;
        if (!netIDRegex.test(requestData.netID)) {
            throw new Error('Invalid NetID format: must be 2-3 letters followed by 2-3 digits.');
        }

        // Validate phone format
        const phoneRegex = /^[\d\s\-\(\)\+]+$/;
        if (!phoneRegex.test(requestData.phone)) {
            throw new Error('Invalid phone number format.');
        }

        // Validate file link format
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(requestData.fileLink)) {
            throw new Error('File link must be a valid HTTP/HTTPS URL.');
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
    get firstName() { return this.#firstName; }
    get lastName() { return this.#lastName; }
    get netID() { return this.#netID; }
    get email() { return this.#email; }
    get phone() { return this.#phone; }
    get projectDescription() { return this.#projectDescription; }
    get fileLink() { return this.#fileLink; }
    get preferredMaterial() { return this.#preferredMaterial; }
    get preferredColor() { return this.#preferredColor; }
    get renderImages() { return [...this.#renderImages]; }
    get timestamp() { return this.#timestamp; }
    get requestId() { return this.#requestId; }

    // Setters with validation
    set firstName(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('First name must be a non-empty string.');
        }
        this.#firstName = name;
    }

    set lastName(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Last name must be a non-empty string.');
        }
        this.#lastName = name;
    }

    set email(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new Error('Invalid email format provided.');
        }
        this.#email = email;
    }

    set preferredMaterial(material) {
        if (!material || typeof material !== 'string') {
            throw new Error('Preferred material must be a non-empty string.');
        }
        this.#preferredMaterial = material;
    }

    set preferredColor(color) {
        if (!color || typeof color !== 'string') {
            throw new Error('Preferred color must be a non-empty string.');
        }
        this.#preferredColor = color;
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