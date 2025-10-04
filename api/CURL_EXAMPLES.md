# API Testing with cURL

This document provides cURL examples for testing the Rutgers Makerspace 3D Printing API.

## Prerequisites

- API server running on `http://localhost:8080`
- cURL installed on your system

## Basic Health Check

```bash
curl -X GET http://localhost:8080/api/health
```

**Expected Response:**
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

## Get Available Materials

```bash
curl -X GET http://localhost:8080/api/materials
```

**Expected Response:**
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
  },
  "timestamp": "2025-10-04T19:53:50.797Z"
}
```

## Get Available Printers

```bash
curl -X GET http://localhost:8080/api/printers
```

**Expected Response:**
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
  },
  "timestamp": "2025-10-04T19:53:50.797Z"
}
```

## Cost Estimation

```bash
curl -X POST http://localhost:8080/api/estimate-cost \
  -H "Content-Type: application/json" \
  -d '{
    "material": "PLA",
    "complexity": "medium",
    "sizeCategory": "medium"
  }'
```

**Expected Response:**
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
  },
  "timestamp": "2025-10-04T19:53:50.797Z"
}
```

## Submit Print Request

```bash
curl -X POST http://localhost:8080/api/print-request \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Expected Response:**
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
  },
  "timestamp": "2025-10-04T19:53:50.797Z"
}
```

## Error Testing

### Invalid Request Data

```bash
curl -X POST http://localhost:8080/api/print-request \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "",
    "email": "invalid-email"
  }'
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Validation failed",
  "code": 400,
  "details": {
    "firstName": "First name is required",
    "email": "Invalid email format"
  },
  "timestamp": "2025-10-04T19:53:50.797Z"
}
```

### Non-existent Endpoint

```bash
curl -X GET http://localhost:8080/api/nonexistent
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Route not found",
  "code": 404,
  "timestamp": "2025-10-04T19:53:50.797Z"
}
```

## Testing Different Materials

### ABS Material
```bash
curl -X POST http://localhost:8080/api/estimate-cost \
  -H "Content-Type: application/json" \
  -d '{
    "material": "ABS",
    "complexity": "complex",
    "sizeCategory": "large"
  }'
```

### TPU Material
```bash
curl -X POST http://localhost:8080/api/estimate-cost \
  -H "Content-Type: application/json" \
  -d '{
    "material": "TPU",
    "complexity": "simple",
    "sizeCategory": "small"
  }'
```

## Testing Different Project Types

### Engineering Project
```bash
curl -X POST http://localhost:8080/api/print-request \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alex",
    "lastName": "Chen",
    "netID": "ac123",
    "email": "ac123@rutgers.edu",
    "phone": "555-987-6543",
    "projectDescription": "High-strength bracket for automotive suspension system prototype",
    "fileLink": "https://drive.google.com/file/bracket.stl",
    "preferredMaterial": "ABS",
    "preferredColor": "Black"
  }'
```

### Flexible Component
```bash
curl -X POST http://localhost:8080/api/print-request \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Maria",
    "lastName": "Rodriguez",
    "netID": "mr456",
    "email": "mr456@rutgers.edu",
    "phone": "555-456-7890",
    "projectDescription": "Flexible phone case with shock absorption for outdoor activities",
    "fileLink": "https://drive.google.com/file/phone_case.stl",
    "preferredMaterial": "TPU",
    "preferredColor": "Blue"
  }'
```

### Decorative Item
```bash
curl -X POST http://localhost:8080/api/print-request \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "David",
    "lastName": "Kim",
    "netID": "dk789",
    "email": "dk789@rutgers.edu",
    "phone": "555-321-0987",
    "projectDescription": "Decorative vase with intricate geometric patterns for home decoration",
    "fileLink": "https://drive.google.com/file/vase.stl",
    "preferredMaterial": "PLA",
    "preferredColor": "White"
  }'
```

## Batch Testing Script

Create a file called `test-api.sh`:

```bash
#!/bin/bash

API_BASE="http://localhost:8080"

echo "Testing Rutgers Makerspace 3D Printing API"
echo "=========================================="

# Health check
echo "1. Health Check:"
curl -s -X GET $API_BASE/api/health | jq '.'
echo ""

# Materials
echo "2. Available Materials:"
curl -s -X GET $API_BASE/api/materials | jq '.data.count'
echo ""

# Printers
echo "3. Available Printers:"
curl -s -X GET $API_BASE/api/printers | jq '.data.count'
echo ""

# Cost estimation
echo "4. Cost Estimation (PLA, medium, medium):"
curl -s -X POST $API_BASE/api/estimate-cost \
  -H "Content-Type: application/json" \
  -d '{"material": "PLA", "complexity": "medium", "sizeCategory": "medium"}' | jq '.data.estimatedCost'
echo ""

# Print request
echo "5. Print Request Submission:"
curl -s -X POST $API_BASE/api/print-request \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "netID": "test123",
    "email": "test@rutgers.edu",
    "phone": "555-000-0000",
    "projectDescription": "Test project for API validation",
    "fileLink": "https://example.com/test.stl",
    "preferredMaterial": "PLA"
  }' | jq '.data.requestId'
echo ""

echo "API testing completed!"
```

Make it executable and run:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Performance Testing

### Load Testing with Apache Bench
```bash
# Test health endpoint with 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:8080/api/health

# Test materials endpoint
ab -n 50 -c 5 http://localhost:8080/api/materials
```

### Stress Testing
```bash
# Test with many concurrent requests
for i in {1..20}; do
  curl -X POST http://localhost:8080/api/estimate-cost \
    -H "Content-Type: application/json" \
    -d '{"material": "PLA", "complexity": "medium", "sizeCategory": "medium"}' &
done
wait
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Make sure the API server is running
2. **JSON Parse Error**: Check that your JSON is valid
3. **Validation Errors**: Ensure all required fields are provided
4. **Rate Limiting**: Wait if you hit the rate limit (100 requests per 15 minutes)

### Debug Mode

Add verbose output to see full HTTP headers:
```bash
curl -v -X GET http://localhost:8080/api/health
```

### Save Responses to Files

```bash
# Save health check response
curl -X GET http://localhost:8080/api/health > health_response.json

# Save materials response
curl -X GET http://localhost:8080/api/materials > materials_response.json
```

This comprehensive cURL testing guide should help you verify all API functionality works correctly!