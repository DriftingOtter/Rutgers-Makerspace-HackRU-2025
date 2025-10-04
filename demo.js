#!/usr/bin/env node

/**
 * Rutgers Makerspace 3D Printing API Demo
 * Demonstrates the API capabilities with sample requests
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080';

// Sample print requests for demonstration
const sampleRequests = [
    {
        name: "Engineering Prototype",
        request: {
            firstName: "Alex",
            lastName: "Chen",
            netID: "ac123",
            email: "ac123@rutgers.edu",
            phone: "555-987-6543",
            projectDescription: "High-strength bracket for automotive suspension system prototype",
            fileLink: "https://drive.google.com/file/bracket.stl",
            preferredMaterial: "ABS",
            preferredColor: "Black",
            renderImages: ["https://example.com/bracket_front.jpg", "https://example.com/bracket_side.jpg"]
        }
    },
    {
        name: "Flexible Component",
        request: {
            firstName: "Maria",
            lastName: "Rodriguez",
            netID: "mr456",
            email: "mr456@rutgers.edu",
            phone: "555-456-7890",
            projectDescription: "Flexible phone case with shock absorption for outdoor activities",
            fileLink: "https://drive.google.com/file/phone_case.stl",
            preferredMaterial: "TPU",
            preferredColor: "Blue",
            renderImages: ["https://example.com/case_front.jpg"]
        }
    },
    {
        name: "Decorative Item",
        request: {
            firstName: "David",
            lastName: "Kim",
            netID: "dk789",
            email: "dk789@rutgers.edu",
            phone: "555-321-0987",
            projectDescription: "Decorative vase with intricate geometric patterns for home decoration",
            fileLink: "https://drive.google.com/file/vase.stl",
            preferredMaterial: "PLA",
            preferredColor: "White",
            renderImages: ["https://example.com/vase_360.jpg"]
        }
    }
];

async function testAPI() {
    console.log('🚀 Rutgers Makerspace 3D Printing API Demo\n');
    
    try {
        // Test health endpoint
        console.log('📊 Testing Health Endpoint...');
        const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
        console.log(`✅ Health Status: ${healthResponse.data.status}`);
        console.log(`   Services: ${JSON.stringify(healthResponse.data.services, null, 2)}\n`);
        
        // Test materials endpoint
        console.log('🧱 Testing Materials Endpoint...');
        const materialsResponse = await axios.get(`${API_BASE_URL}/api/materials`);
        console.log(`✅ Available Materials: ${materialsResponse.data.data.count}`);
        console.log(`   Materials: ${materialsResponse.data.data.materials.map(m => m.name).join(', ')}\n`);
        
        // Test printers endpoint
        console.log('🖨️  Testing Printers Endpoint...');
        const printersResponse = await axios.get(`${API_BASE_URL}/api/printers`);
        console.log(`✅ Available Printers: ${printersResponse.data.data.count}`);
        console.log(`   Printers: ${printersResponse.data.data.printers.map(p => p.name).join(', ')}\n`);
        
        // Test cost estimation
        console.log('💰 Testing Cost Estimation...');
        const costResponse = await axios.post(`${API_BASE_URL}/api/estimate-cost`, {
            material: 'PETG',
            complexity: 'medium',
            sizeCategory: 'medium'
        });
        console.log(`✅ Cost Estimate: ${costResponse.data.data.estimatedCost}`);
        console.log(`   Range: ${costResponse.data.data.minCost} - ${costResponse.data.data.maxCost}\n`);
        
        // Test print requests
        console.log('🎯 Testing Print Request Processing...\n');
        
        for (const sample of sampleRequests) {
            console.log(`📋 Processing: ${sample.name}`);
            
            try {
                const response = await axios.post(`${API_BASE_URL}/api/print-request`, sample.request);
                
                const data = response.data.data;
                console.log(`✅ Request ID: ${data.requestId}`);
                console.log(`   Recommended Printer: ${data.recommendations.recommendedPrinter}`);
                console.log(`   Recommended Material: ${data.recommendations.recommendedMaterial}`);
                console.log(`   Estimated Cost: ${data.recommendations.estimatedCost}`);
                console.log(`   Print Time: ${data.recommendations.estimatedPrintTime}`);
                console.log(`   AI Confidence: ${data.aiAnalysis.confidence}`);
                console.log(`   Material Reasoning: ${data.reasoning.material.substring(0, 80)}...`);
                console.log('');
                
            } catch (error) {
                console.log(`❌ Error processing ${sample.name}: ${error.response?.data?.message || error.message}`);
                console.log('');
            }
        }
        
        console.log('🎉 Demo completed successfully!');
        console.log('\n📚 API Documentation: http://localhost:3000/api/config');
        console.log('🏥 Health Check: http://localhost:3000/api/health');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure the API server is running: npm start');
        }
    }
}

// Run the demo
if (require.main === module) {
    testAPI();
}

module.exports = { testAPI, sampleRequests };