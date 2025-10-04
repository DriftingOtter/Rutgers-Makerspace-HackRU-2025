# React Integration Example

This folder contains a complete React application example that demonstrates how to integrate with the Rutgers Makerspace 3D Printing API.

## Quick Start

1. **Create a new React app**:
   ```bash
   npx create-react-app rutgers-makerspace-frontend
   cd rutgers-makerspace-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install axios
   # For TypeScript support:
   npm install --save-dev @types/react @types/react-dom
   ```

3. **Copy the example files** from this directory to your React app:
   - `src/services/printingApi.js` → Your React app's `src/services/`
   - `src/hooks/usePrintingApi.js` → Your React app's `src/hooks/`
   - `src/components/` → Your React app's `src/components/`
   - `src/App.js` → Replace your React app's `src/App.js`

4. **Start the API server** (in a separate terminal):
   ```bash
   cd api
   npm start
   ```

5. **Start the React app**:
   ```bash
   npm start
   ```

## Features Demonstrated

- ✅ **API Health Monitoring**: Real-time status checking
- ✅ **Material Selection**: Dynamic dropdown with API data
- ✅ **Printer Selection**: Real-time printer availability
- ✅ **Cost Estimation**: Interactive cost calculator
- ✅ **Print Request Submission**: Complete form with validation
- ✅ **AI Analysis Display**: Shows AI recommendations and reasoning
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Loading States**: Proper loading indicators
- ✅ **TypeScript Support**: Full type definitions included

## API Endpoints Used

- `GET /api/health` - Health check
- `GET /api/materials` - Available materials
- `GET /api/printers` - Available printers
- `POST /api/estimate-cost` - Cost estimation
- `POST /api/print-request` - Submit print request

## Customization

### Styling
The example includes basic CSS styling. You can customize the appearance by modifying the CSS classes in `src/App.css`.

### API Configuration
Update the `API_BASE_URL` in `src/services/printingApi.js` to point to your API server.

### Form Validation
Add additional validation rules in the form components as needed for your specific requirements.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure the API server is running and accessible
2. **API Not Responding**: Check that the API server is running on port 8080
3. **Form Validation**: Ensure all required fields are filled before submission

### Debug Mode

Enable debug logging by adding this to your browser's console:
```javascript
localStorage.setItem('debug', 'true');
```

## Next Steps

1. **Add Authentication**: Implement user authentication if needed
2. **File Upload**: Add support for direct file uploads
3. **Real-time Updates**: Use WebSockets for live status updates
4. **Mobile Support**: Add responsive design for mobile devices
5. **Advanced Features**: Add project history, favorites, etc.

## Support

For API-related issues, check the main API documentation in `../DEVELOPER_API.md`.
For React-specific questions, refer to the [React documentation](https://reactjs.org/docs/).