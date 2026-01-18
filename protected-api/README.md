# Protected API Server

Express API demonstrating JWT token validation and scope-based authorization with Azure AD tokens.

## Features

- JWT signature validation using Azure AD public keys
- Audience and issuer claim verification
- Scope-based authorization middleware
- CORS configured for local development
- Detailed logging for debugging

## Configuration

Create `.env`:
```
TENANT_ID=<azure-tenant-id>
CLIENT_ID=<azure-client-id>
PORT=3001
```

## Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm start
```

## Endpoints

### Public
- `GET /api/public` - No auth required
- `GET /health` - Health check

### Protected
- `GET /api/protected` - Requires valid token
- `GET /api/me` - User profile from token
- `GET /api/admin` - Requires `User.Read` scope

## Token Validation

The middleware validates:
1. Token signature (RS256)
2. Audience: `api://YOUR_CLIENT_ID`
3. Issuer: `https://sts.windows.net/TENANT_ID/`
4. Expiration time
5. Required scopes (where applicable)
```
