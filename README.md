# Mapsly Proxy

A Node.js proxy server for integrating with the Mapsly API. This project provides a secure middleware layer to forward appointment and deal requests from external services (like HubSpot) to Mapsly while handling authentication and error management.

## Overview

**Mapsly Proxy** is an Express-based server that acts as an intermediary between your applications and the Mapsly REST API. It simplifies API integration by handling:

- **Request forwarding** to Mapsly endpoints
- **API key management** via environment variables
- **CORS handling** for cross-origin requests
- **Error handling and logging**
- **Request parsing** for multiple content types
- **Deal and appointment management** through standardized endpoints

## Features

- ✅ Secure API key management
- ✅ CORS-enabled for frontend integration
- ✅ Express.js-based RESTful server
- ✅ Health check endpoint
- ✅ Comprehensive error handling
- ✅ Support for JSON request parsing
- ✅ Appointment/deal creation and management
- ✅ HubSpot integration ready

## Project Structure

```
mapsly-proxy/
├── server.js                      # Main Express server
├── api/
│   ├── mapsly-appointment.js      # Appointment handler for serverless deployment
│   └── test.js                    # Health check endpoint
├── package.json                   # Project dependencies and metadata
└── README.md                      # This file
```

## Technology Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js 4.19.0
- **HTTP Client**: Axios 1.7.0
- **CORS**: cors 2.8.5
- **License**: MIT

## Installation

### Prerequisites

- Node.js 14+ installed
- npm or yarn package manager
- Mapsly API key (obtain from your Mapsly account)

### Setup Steps

1. **Clone the repository** (if using git):
   ```bash
   git clone https://github.com/Camilo010406/mapsly-proxy.git
   cd mapsly-proxy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MAPSLY_API_KEY=your_mapsly_api_key_here
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### 1. Health Check

**GET** `/test`

Returns a health status of the server.

**Response**:
```json
{
  "ok": true
}
```

### 2. Proxy Endpoint

**POST** `/proxy`

Forwards requests to the Mapsly API. This is the main endpoint for deal management.

**Request Body** (JSON array):
```json
[
  {
    "id": "deal_id",
    "field_name": "value",
    ...
  }
]
```

**Response**:
- Success (200): Returns Mapsly API response
- Error (400): Invalid request format
- Error (500): Missing API key or server error

**Example Request**:
```bash
curl -X POST http://localhost:3000/proxy \
  -H "Content-Type: application/json" \
  -d '[{"id": "123", "name": "John Doe"}]'
```

### 3. Appointment Handler (Serverless)

**File**: `api/mapsly-appointment.js`

**POST** request handler for appointment creation/updates.

**Required Parameters**:
- `id`: Deal/appointment identifier
- `appointment_date_time`: Date and time of the appointment
- `van`: Van assignment

**Optional Parameters**:
- `address`: Address string
- `city`: City name
- `state`: State code
- `postal_code_new`: Postal code

**Response**:
```json
{
  "ok": true,
  "body": { /* Mapsly response */ }
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | No |
| `MAPSLY_API_KEY` | Your Mapsly API authentication key | Yes |

## Usage Examples

### Local Development

1. Start the server:
   ```bash
   npm start
   ```

2. Test the health check:
   ```bash
   curl http://localhost:3000/test
   ```

3. Send a test request to the proxy:
   ```bash
   curl -X POST http://localhost:3000/proxy \
     -H "Content-Type: application/json" \
     -d '[{"id": "test-id", "name": "Test Deal"}]'
   ```

### Integration with HubSpot

This proxy can receive forwarded requests from HubSpot workflows:

```javascript
// HubSpot sends data to your proxy
POST https://your-domain.com/proxy
Content-Type: application/json

[{
  "id": "hubspot-deal-id",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code_new": "10001",
  "appointment_date_time": "2024-01-15T14:30:00Z",
  "van": "Van-A-001"
}]
```

## Error Handling

The server includes comprehensive error handling:

- **400 Bad Request**: Malformed JSON or missing required parameters
- **405 Method Not Allowed**: Invalid HTTP method (non-POST requests to specific endpoints)
- **500 Internal Server Error**: Missing API key, Mapsly service unavailable, or other server errors

All errors include detailed information in the response for debugging.

## Available Scripts

```bash
# Start the server
npm start

# Run tests (currently not configured)
npm test
```

## Development

### Adding New Endpoints

1. Create a handler function in the `api/` directory
2. Import and mount it in `server.js`:
   ```javascript
   app.post('/new-endpoint', handler);
   ```

3. Test with curl or your API client

### Logging

The server logs important events to the console:
- Incoming requests
- API responses
- Errors and exceptions

Implement a logging service for production deployments.

## Security Considerations

- ⚠️ **Never commit your `.env` file** or API keys to version control
- ⚠️ Use HTTPS in production
- ⚠️ Implement rate limiting for production
- ⚠️ Add authentication/authorization middleware as needed
- ⚠️ Validate and sanitize all incoming data
- ⚠️ Use a `.gitignore` file to exclude sensitive files:
  ```
  .env
  node_modules/
  .DS_Store
  ```

## Deployment

### Heroku

1. Set up Heroku environment variables:
   ```bash
   heroku config:set MAPSLY_API_KEY=your_api_key
   ```

2. Deploy:
   ```bash
   git push heroku main
   ```

### Vercel / Netlify Functions

The `api/` directory handlers can be deployed as serverless functions.

### Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t mapsly-proxy .
docker run -p 3000:3000 -e MAPSLY_API_KEY=your_key mapsly-proxy
```

## Troubleshooting

### Issue: "MAPSLY_API_KEY not configured"
- **Solution**: Ensure your `.env` file exists and contains the `MAPSLY_API_KEY` variable
- Check that the `.env` file is in the root directory

### Issue: CORS errors in browser
- **Solution**: CORS is already configured in the server. If still getting errors, verify the request origin is allowed

### Issue: Connection refused on localhost:3000
- **Solution**: Check if port 3000 is already in use
- Try a different port: `PORT=3001 npm start`

### Issue: Bad Gateway or 502 errors
- **Solution**: Verify your Mapsly API key is valid
- Check Mapsly API status at https://api.mapsly.com

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

For issues and questions:
- **GitHub Issues**: [Report issues here](https://github.com/Camilo010406/mapsly-proxy/issues)
- **Mapsly Documentation**: [Mapsly API Docs](https://api.mapsly.com)

## License

This project is licensed under the **MIT License** - see the LICENSE file for details.

## Repository

- **GitHub**: https://github.com/Camilo010406/mapsly-proxy
- **Issues**: https://github.com/Camilo010406/mapsly-proxy/issues

---

**Last Updated**: April 2026
**Version**: 1.0.0