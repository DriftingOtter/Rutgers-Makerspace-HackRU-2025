const request = require('supertest');
const app = require('../src/app').getApp();

describe('Rutgers Makerspace 3D Printing API', () => {
    describe('GET /', () => {
        it('should return API information', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.message).toContain('Rutgers Makerspace');
            expect(response.body.endpoints).toBeDefined();
        });
    });

    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body.status).toBe('healthy');
            expect(response.body.timestamp).toBeDefined();
            expect(response.body.uptime).toBeDefined();
        });
    });

    describe('GET /api/materials', () => {
        it('should return available materials', async () => {
            const response = await request(app)
                .get('/api/materials')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.materials).toBeDefined();
            expect(response.body.data.count).toBeGreaterThan(0);
        });
    });

    describe('GET /api/printers', () => {
        it('should return available printers', async () => {
            const response = await request(app)
                .get('/api/printers')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.printers).toBeDefined();
            expect(response.body.data.count).toBeGreaterThan(0);
        });
    });

    describe('GET /api/config', () => {
        it('should return API configuration', async () => {
            const response = await request(app)
                .get('/api/config')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.api).toBeDefined();
            expect(response.body.data.features).toBeDefined();
            expect(response.body.data.supportedMaterials).toBeDefined();
        });
    });

    describe('POST /api/print-request', () => {
        const validRequest = {
            firstName: 'Jane',
            lastName: 'Doe',
            netID: 'jd567',
            email: 'jd567@rutgers.edu',
            phone: '555-123-4567',
            projectDescription: 'Ergonomic tool handle for mechanical assembly line prototype',
            fileLink: 'https://drive.google.com/file/handle.obj',
            preferredMaterial: 'PETG',
            preferredColor: 'Grey',
            renderImages: ['handle_front.png', 'handle_side.png']
        };

        it('should validate required fields', async () => {
            const invalidRequest = { ...validRequest };
            delete invalidRequest.firstName;

            const response = await request(app)
                .post('/api/print-request')
                .send(invalidRequest)
                .expect(422);

            expect(response.body.status).toBe('error');
            expect(response.body.errors).toBeDefined();
        });

        it('should validate email format', async () => {
            const invalidRequest = { ...validRequest };
            invalidRequest.email = 'invalid-email';

            const response = await request(app)
                .post('/api/print-request')
                .send(invalidRequest)
                .expect(422);

            expect(response.body.status).toBe('error');
            expect(response.body.errors).toBeDefined();
        });

        it('should validate NetID format', async () => {
            const invalidRequest = { ...validRequest };
            invalidRequest.netID = 'invalid-netid';

            const response = await request(app)
                .post('/api/print-request')
                .send(invalidRequest)
                .expect(422);

            expect(response.body.status).toBe('error');
            expect(response.body.errors).toBeDefined();
        });

        it('should validate material selection', async () => {
            const invalidRequest = { ...validRequest };
            invalidRequest.preferredMaterial = 'INVALID_MATERIAL';

            const response = await request(app)
                .post('/api/print-request')
                .send(invalidRequest)
                .expect(422);

            expect(response.body.status).toBe('error');
            expect(response.body.errors).toBeDefined();
        });

        it('should process valid request (mock mode)', async () => {
            // This test will work even without Gemini API key due to fallback logic
            const response = await request(app)
                .post('/api/print-request')
                .send(validRequest)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.requestId).toBeDefined();
            expect(response.body.data.recommendations).toBeDefined();
            expect(response.body.data.recommendations.recommendedMaterial).toBeDefined();
            expect(response.body.data.recommendations.recommendedPrinter).toBeDefined();
            expect(response.body.data.recommendations.estimatedCost).toBeDefined();
        });
    });

    describe('POST /api/estimate-cost', () => {
        it('should estimate cost for valid material', async () => {
            const response = await request(app)
                .post('/api/estimate-cost')
                .send({
                    material: 'PLA',
                    complexity: 'medium',
                    sizeCategory: 'medium'
                })
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.minCost).toBeDefined();
            expect(response.body.data.maxCost).toBeDefined();
            expect(response.body.data.estimatedCost).toBeDefined();
        });

        it('should require material parameter', async () => {
            const response = await request(app)
                .post('/api/estimate-cost')
                .send({
                    complexity: 'medium',
                    sizeCategory: 'medium'
                })
                .expect(422);

            expect(response.body.status).toBe('error');
            expect(response.body.message).toContain('Material is required');
        });
    });

    describe('Error handling', () => {
        it('should handle 404 for unknown routes', async () => {
            const response = await request(app)
                .get('/unknown-route')
                .expect(404);

            expect(response.body.status).toBe('error');
            expect(response.body.message).toContain('not found');
        });

        it('should handle invalid JSON', async () => {
            const response = await request(app)
                .post('/api/print-request')
                .set('Content-Type', 'application/json')
                .send('invalid json')
                .expect(400);

            expect(response.body.status).toBe('error');
        });
    });
});