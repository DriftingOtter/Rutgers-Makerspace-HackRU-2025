# Rutgers Makerspace 3D Printing API - Developer Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL & Endpoints](#base-url--endpoints)
4. [API Endpoints](#api-endpoints)
5. [Request/Response Formats](#requestresponse-formats)
6. [Error Handling](#error-handling)
7. [React Integration Examples](#react-integration-examples)
8. [TypeScript Support](#typescript-support)
9. [Rate Limiting](#rate-limiting)
10. [Testing](#testing)

## Overview

The Rutgers Makerspace 3D Printing API provides intelligent 3D printing recommendations using Google Gemini AI. It analyzes project descriptions, recommends materials and printers, estimates costs, and optimizes print settings.

### Key Features
- 🤖 AI-powered project analysis
- 🖨️ Smart printer and material recommendations
- 💰 Real-time cost estimation
- ⚙️ Print settings optimization
- 📊 Comprehensive project validation

## Authentication

Currently, the API does not require authentication for development. In production, you may want to implement API keys or JWT tokens.

## Base URL & Endpoints

**Base URL**: `http://localhost:8080`

**Available Endpoints**:
- `GET /api/health` - Health check
- `GET /api/config` - API configuration
- `GET /api/materials` - Available materials
- `GET /api/printers` - Available printers
- `GET /api/pricing` - Pricing information
- `POST /api/estimate-cost` - Cost estimation
- `POST /api/print-request` - Submit print request

## API Endpoints

### 1. Health Check

**GET** `/api/health`

Check if the API is running and all services are healthy.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-04T19:53:50.797Z",
  "services": {
    "geminiConnection": true,
    "materialAdvisor": true,
    "printerSelector": true,
    "pricingEngine": true
  }
}
```

### 2. Get Available Materials

**GET** `/api/materials`

Retrieve all available 3D printing materials.

**Response**:
```json
{
  "status": "success",
  "data": {
    "count": 9,
    "materials": [
      {
        "name": "PLA",
        "type": "filament",
        "properties": {
          "strength": "medium",
          "flexibility": "low",
          "temperature": "low",
          "cost": "low"
        },
        "description": "Easy to print, biodegradable, good for beginners"
      }
    ]
  }
}
```

### 3. Get Available Printers

**GET** `/api/printers`

Retrieve all available 3D printers.

**Response**:
```json
{
  "status": "success",
  "data": {
    "count": 4,
    "printers": [
      {
        "id": "prusa-mk4",
        "name": "Prusa MK4",
        "type": "FDM",
        "materials": ["PLA", "PETG", "ABS", "ASA"],
        "maxBuildVolume": "250x210x220mm",
        "status": "available"
      }
    ]
  }
}
```

### 4. Cost Estimation

**POST** `/api/estimate-cost`

Estimate the cost of a 3D printing project.

**Request Body**:
```json
{
  "material": "PLA",
  "complexity": "medium",
  "sizeCategory": "medium"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "estimatedCost": 6.90,
    "minCost": 5.52,
    "maxCost": 8.97,
    "breakdown": {
      "materialCost": 3.45,
      "laborCost": 2.30,
      "overhead": 1.15
    }
  }
}
```

### 5. Submit Print Request

**POST** `/api/print-request`

Submit a 3D printing request for AI analysis and recommendations.

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "netID": "jd123",
  "email": "jd123@rutgers.edu",
  "phone": "555-123-4567",
  "projectDescription": "A simple phone stand for desk use",
  "fileLink": "https://drive.google.com/file/phone_stand.stl",
  "preferredMaterial": "PLA",
  "preferredColor": "Black",
  "renderImages": [
    "https://example.com/phone_stand_front.jpg"
  ]
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "requestId": "REQ_MGCP39GT_3A13C",
    "recommendations": {
      "recommendedPrinter": "Prusa MK4",
      "recommendedMaterial": "PLA",
      "estimatedCost": 11.74,
      "estimatedPrintTime": "1 hours",
      "complexity": "simple",
      "supportsNeeded": false,
      "qualityRecommendation": "standard"
    },
    "aiAnalysis": {
      "confidence": 0.95,
      "reasoning": "PLA is an excellent choice for decorative prints..."
    },
    "reasoning": {
      "material": "AI-recommended PLA: PLA is an excellent choice...",
      "printer": "Prusa MK4 selected for its reliability and PLA compatibility",
      "settings": "Standard quality recommended for good balance of time and finish"
    }
  }
}
```

## Request/Response Formats

### Standard Response Format

All successful responses follow this format:
```json
{
  "status": "success",
  "data": { /* response data */ },
  "timestamp": "2025-10-04T19:53:50.797Z"
}
```

### Error Response Format

All error responses follow this format:
```json
{
  "status": "error",
  "message": "Error description",
  "code": 400,
  "timestamp": "2025-10-04T19:53:50.797Z"
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

### Common Error Scenarios

1. **Validation Errors** (400):
   ```json
   {
     "status": "error",
     "message": "Validation failed",
     "code": 400,
     "details": {
       "email": "Invalid email format",
       "phone": "Phone number is required"
     }
   }
   ```

2. **Rate Limiting** (429):
   ```json
   {
     "status": "error",
     "message": "Too many requests. Please try again later.",
     "code": 429,
     "retryAfter": 900
   }
   ```

## React Integration Examples

### 1. Basic API Service

Create a service file for API calls:

```javascript
// src/services/printingApi.js
const API_BASE_URL = 'http://localhost:8080';

class PrintingApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.request('/api/health');
  }

  // Get materials
  async getMaterials() {
    return this.request('/api/materials');
  }

  // Get printers
  async getPrinters() {
    return this.request('/api/printers');
  }

  // Estimate cost
  async estimateCost(projectData) {
    return this.request('/api/estimate-cost', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  // Submit print request
  async submitPrintRequest(requestData) {
    return this.request('/api/print-request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }
}

export default new PrintingApiService();
```

### 2. React Hook for API State Management

```javascript
// src/hooks/usePrintingApi.js
import { useState, useEffect } from 'react';
import printingApi from '../services/printingApi';

export const usePrintingApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [isHealthy, setIsHealthy] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [healthResponse, materialsResponse, printersResponse] = await Promise.all([
        printingApi.checkHealth(),
        printingApi.getMaterials(),
        printingApi.getPrinters(),
      ]);

      setIsHealthy(healthResponse.status === 'healthy');
      setMaterials(materialsResponse.data.materials);
      setPrinters(printersResponse.data.printers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const estimateCost = async (projectData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await printingApi.estimateCost(projectData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async (requestData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await printingApi.submitPrintRequest(requestData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    materials,
    printers,
    isHealthy,
    estimateCost,
    submitRequest,
    refetch: loadInitialData,
  };
};
```

### 3. Print Request Form Component

```javascript
// src/components/PrintRequestForm.jsx
import React, { useState } from 'react';
import { usePrintingApi } from '../hooks/usePrintingApi';

const PrintRequestForm = () => {
  const { materials, printers, loading, error, submitRequest } = usePrintingApi();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    netID: '',
    email: '',
    phone: '',
    projectDescription: '',
    fileLink: '',
    preferredMaterial: '',
    preferredColor: '',
    renderImages: [],
  });
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageAdd = () => {
    setFormData(prev => ({
      ...prev,
      renderImages: [...prev.renderImages, ''],
    }));
  };

  const handleImageChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      renderImages: prev.renderImages.map((img, i) => 
        i === index ? value : img
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    try {
      const response = await submitRequest(formData);
      setResult(response);
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  if (loading && !result) {
    return <div className="loading">Loading materials and printers...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="print-request-form">
      <h2>Submit 3D Printing Request</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>NetID:</label>
          <input
            type="text"
            name="netID"
            value={formData.netID}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Phone:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Project Description:</label>
          <textarea
            name="projectDescription"
            value={formData.projectDescription}
            onChange={handleInputChange}
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>File Link (Google Drive, etc.):</label>
          <input
            type="url"
            name="fileLink"
            value={formData.fileLink}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Preferred Material:</label>
          <select
            name="preferredMaterial"
            value={formData.preferredMaterial}
            onChange={handleInputChange}
          >
            <option value="">Select Material</option>
            {materials.map((material) => (
              <option key={material.name} value={material.name}>
                {material.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Preferred Color:</label>
          <input
            type="text"
            name="preferredColor"
            value={formData.preferredColor}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label>Render Images:</label>
          {formData.renderImages.map((image, index) => (
            <input
              key={index}
              type="url"
              value={image}
              onChange={(e) => handleImageChange(index, e.target.value)}
              placeholder="Image URL"
            />
          ))}
          <button type="button" onClick={handleImageAdd}>
            Add Image
          </button>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      {result && (
        <div className="result">
          <h3>AI Analysis Results</h3>
          <div className="recommendations">
            <p><strong>Request ID:</strong> {result.requestId}</p>
            <p><strong>Recommended Printer:</strong> {result.recommendations.recommendedPrinter}</p>
            <p><strong>Recommended Material:</strong> {result.recommendations.recommendedMaterial}</p>
            <p><strong>Estimated Cost:</strong> ${result.recommendations.estimatedCost}</p>
            <p><strong>Print Time:</strong> {result.recommendations.estimatedPrintTime}</p>
            <p><strong>Complexity:</strong> {result.recommendations.complexity}</p>
            <p><strong>Supports Needed:</strong> {result.recommendations.supportsNeeded ? 'Yes' : 'No'}</p>
            <p><strong>AI Confidence:</strong> {(result.aiAnalysis.confidence * 100).toFixed(1)}%</p>
          </div>
          <div className="reasoning">
            <h4>AI Reasoning:</h4>
            <p><strong>Material:</strong> {result.reasoning.material}</p>
            <p><strong>Printer:</strong> {result.reasoning.printer}</p>
            <p><strong>Settings:</strong> {result.reasoning.settings}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintRequestForm;
```

### 4. Cost Estimation Component

```javascript
// src/components/CostEstimator.jsx
import React, { useState } from 'react';
import { usePrintingApi } from '../hooks/usePrintingApi';

const CostEstimator = () => {
  const { materials, estimateCost, loading, error } = usePrintingApi();
  const [projectData, setProjectData] = useState({
    material: '',
    complexity: 'medium',
    sizeCategory: 'medium',
  });
  const [estimate, setEstimate] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEstimate = async (e) => {
    e.preventDefault();
    setEstimate(null);

    try {
      const response = await estimateCost(projectData);
      setEstimate(response);
    } catch (err) {
      console.error('Estimation failed:', err);
    }
  };

  return (
    <div className="cost-estimator">
      <h2>Cost Estimator</h2>
      
      <form onSubmit={handleEstimate}>
        <div className="form-group">
          <label>Material:</label>
          <select
            name="material"
            value={projectData.material}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Material</option>
            {materials.map((material) => (
              <option key={material.name} value={material.name}>
                {material.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Complexity:</label>
          <select
            name="complexity"
            value={projectData.complexity}
            onChange={handleInputChange}
          >
            <option value="simple">Simple</option>
            <option value="medium">Medium</option>
            <option value="complex">Complex</option>
            <option value="very_complex">Very Complex</option>
          </select>
        </div>

        <div className="form-group">
          <label>Size Category:</label>
          <select
            name="sizeCategory"
            value={projectData.sizeCategory}
            onChange={handleInputChange}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Estimating...' : 'Get Estimate'}
        </button>
      </form>

      {error && <div className="error">Error: {error}</div>}

      {estimate && (
        <div className="estimate-result">
          <h3>Cost Estimate</h3>
          <div className="cost-breakdown">
            <p><strong>Estimated Cost:</strong> ${estimate.estimatedCost}</p>
            <p><strong>Range:</strong> ${estimate.minCost} - ${estimate.maxCost}</p>
            <div className="breakdown">
              <h4>Cost Breakdown:</h4>
              <p>Material Cost: ${estimate.breakdown.materialCost}</p>
              <p>Labor Cost: ${estimate.breakdown.laborCost}</p>
              <p>Overhead: ${estimate.breakdown.overhead}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostEstimator;
```

### 5. Main App Component

```javascript
// src/App.jsx
import React, { useState } from 'react';
import PrintRequestForm from './components/PrintRequestForm';
import CostEstimator from './components/CostEstimator';
import { usePrintingApi } from './hooks/usePrintingApi';
import './App.css';

function App() {
  const { isHealthy, loading } = usePrintingApi();
  const [activeTab, setActiveTab] = useState('request');

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  if (!isHealthy) {
    return (
      <div className="app-error">
        <h1>Service Unavailable</h1>
        <p>The 3D printing API is currently unavailable. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Rutgers Makerspace 3D Printing</h1>
        <nav>
          <button 
            className={activeTab === 'request' ? 'active' : ''}
            onClick={() => setActiveTab('request')}
          >
            Submit Request
          </button>
          <button 
            className={activeTab === 'estimate' ? 'active' : ''}
            onClick={() => setActiveTab('estimate')}
          >
            Cost Estimator
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'request' && <PrintRequestForm />}
        {activeTab === 'estimate' && <CostEstimator />}
      </main>
    </div>
  );
}

export default App;
```

### 6. CSS Styles

```css
/* src/App.css */
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 20px;
}

.app-header h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.app-header nav {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.app-header button {
  padding: 10px 20px;
  border: 2px solid #3498db;
  background: white;
  color: #3498db;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.3s;
}

.app-header button:hover {
  background: #3498db;
  color: white;
}

.app-header button.active {
  background: #3498db;
  color: white;
}

.print-request-form,
.cost-estimator {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #2c3e50;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

button[type="submit"] {
  background: #27ae60;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

button[type="submit"]:hover:not(:disabled) {
  background: #229954;
}

button[type="submit"]:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.result {
  margin-top: 30px;
  padding: 20px;
  background: #e8f5e8;
  border-radius: 5px;
  border-left: 4px solid #27ae60;
}

.recommendations {
  margin-bottom: 20px;
}

.recommendations p {
  margin: 10px 0;
  font-size: 16px;
}

.reasoning {
  background: #f0f8ff;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #3498db;
}

.estimate-result {
  margin-top: 30px;
  padding: 20px;
  background: #fff3cd;
  border-radius: 5px;
  border-left: 4px solid #ffc107;
}

.cost-breakdown p {
  margin: 10px 0;
  font-size: 16px;
}

.breakdown {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 5px;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #7f8c8d;
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #dc3545;
  margin: 20px 0;
}

.app-loading {
  text-align: center;
  padding: 100px;
  font-size: 24px;
  color: #7f8c8d;
}

.app-error {
  text-align: center;
  padding: 100px;
  color: #dc3545;
}

.app-error h1 {
  color: #dc3545;
  margin-bottom: 20px;
}
```

## TypeScript Support

### Type Definitions

```typescript
// src/types/api.ts
export interface Material {
  name: string;
  type: string;
  properties: {
    strength: string;
    flexibility: string;
    temperature: string;
    cost: string;
  };
  description: string;
}

export interface Printer {
  id: string;
  name: string;
  type: string;
  materials: string[];
  maxBuildVolume: string;
  status: string;
}

export interface CostEstimate {
  estimatedCost: number;
  minCost: number;
  maxCost: number;
  breakdown: {
    materialCost: number;
    laborCost: number;
    overhead: number;
  };
}

export interface PrintRequest {
  firstName: string;
  lastName: string;
  netID: string;
  email: string;
  phone: string;
  projectDescription: string;
  fileLink: string;
  preferredMaterial?: string;
  preferredColor?: string;
  renderImages?: string[];
}

export interface PrintRequestResponse {
  requestId: string;
  recommendations: {
    recommendedPrinter: string;
    recommendedMaterial: string;
    estimatedCost: number;
    estimatedPrintTime: string;
    complexity: string;
    supportsNeeded: boolean;
    qualityRecommendation: string;
  };
  aiAnalysis: {
    confidence: number;
    reasoning: string;
  };
  reasoning: {
    material: string;
    printer: string;
    settings: string;
  };
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  code?: number;
  timestamp: string;
}
```

### TypeScript Hook

```typescript
// src/hooks/usePrintingApi.ts
import { useState, useEffect } from 'react';
import printingApi from '../services/printingApi';
import { Material, Printer, CostEstimate, PrintRequest, PrintRequestResponse } from '../types/api';

interface UsePrintingApiReturn {
  loading: boolean;
  error: string | null;
  materials: Material[];
  printers: Printer[];
  isHealthy: boolean;
  estimateCost: (projectData: {
    material: string;
    complexity: string;
    sizeCategory: string;
  }) => Promise<CostEstimate>;
  submitRequest: (requestData: PrintRequest) => Promise<PrintRequestResponse>;
  refetch: () => Promise<void>;
}

export const usePrintingApi = (): UsePrintingApiReturn => {
  // ... implementation same as JavaScript version
};
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Window**: 15 minutes (900 seconds)
- **Max Requests**: 100 per window per IP
- **Response**: 429 status with retry-after header

## Testing

### Unit Tests Example

```javascript
// src/services/__tests__/printingApi.test.js
import printingApi from '../printingApi';

// Mock fetch
global.fetch = jest.fn();

describe('PrintingApiService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should check health successfully', async () => {
    const mockResponse = {
      status: 'healthy',
      services: { geminiConnection: true }
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await printingApi.checkHealth();
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/health', expect.any(Object));
  });

  it('should handle API errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(printingApi.checkHealth()).rejects.toThrow('Network error');
  });
});
```

### Integration Tests

```javascript
// src/components/__tests__/PrintRequestForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PrintRequestForm from '../PrintRequestForm';
import { usePrintingApi } from '../../hooks/usePrintingApi';

// Mock the hook
jest.mock('../../hooks/usePrintingApi');

describe('PrintRequestForm', () => {
  const mockSubmitRequest = jest.fn();
  const mockMaterials = [
    { name: 'PLA', type: 'filament' },
    { name: 'ABS', type: 'filament' }
  ];

  beforeEach(() => {
    usePrintingApi.mockReturnValue({
      materials: mockMaterials,
      printers: [],
      loading: false,
      error: null,
      submitRequest: mockSubmitRequest,
    });
  });

  it('should render form fields', () => {
    render(<PrintRequestForm />);
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });

  it('should submit form with correct data', async () => {
    const mockResult = {
      requestId: 'REQ_123',
      recommendations: { recommendedMaterial: 'PLA' }
    };
    
    mockSubmitRequest.mockResolvedValueOnce(mockResult);
    
    render(<PrintRequestForm />);
    
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByLabelText(/project description/i), {
      target: { value: 'Test project' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /submit request/i }));
    
    await waitFor(() => {
      expect(mockSubmitRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          projectDescription: 'Test project'
        })
      );
    });
  });
});
```

This comprehensive documentation provides everything needed to integrate the Rutgers Makerspace 3D Printing API into a React application, including TypeScript support, error handling, and testing examples.