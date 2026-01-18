# Entra ID OAuth 2.0 / OpenID Connect Demo

A complete OAuth 2.0 and OpenID Connect implementation using Entra ID, demonstrating both client-side authentication and server-side token validation. Built to show practical understanding of modern identity protocols beyond vendor tool configuration.

## What This Demonstrates

After years of configuring enterprise identity providers like PingFederate, I built this to prove I understand the underlying OAuth 2.0 / OIDC protocols from both perspectives:

- **Client Application** - How apps integrate with OAuth providers
- **Resource Server (API)** - How to validate JWT tokens and enforce scope-based authorization
- **Real-world integration** - Using Entra ID as the Identity Provider

## Architecture
```
┌─────────────────┐
│   End User      │
│   (Browser)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐         ┌──────────────────┐
│   Client App        │         │  Protected API   │
│   (React + MSAL)    │────────▶│  (Express + JWT) │
│                     │  Bearer │                  │
│  - Login/Logout     │  Token  │  - Token Validate│
│  - Get Tokens       │         │  - Scope Check   │
│  - Call API         │         │  - User Info     │
└────────┬────────────┘         └──────────────────┘
         │
         │ OAuth 2.0
         │ Authorization Code + PKCE
         ▼
┌─────────────────────┐
│   Entra ID          │
│   (Identity Provider)│
│                     │
│  - User Auth        │
│  - Token Issuance   │
│  - JWKS Endpoint    │
└─────────────────────┘
```

## Features

### Client Application (`client-app/`)
- ✅ OAuth 2.0 Authorization Code Flow with PKCE
- ✅ OpenID Connect authentication
- ✅ Entra ID integration using MSAL.js
- ✅ Token acquisition (ID token + Access token)
- ✅ JWT decoding and claims visualization
- ✅ Microsoft Graph API integration
- ✅ Protected API calls with bearer tokens

### Protected API (`protected-api/`)
- ✅ JWT token validation (signature + claims)
- ✅ Entra ID JWKS integration for key retrieval
- ✅ Audience and issuer verification
- ✅ Scope-based authorization
- ✅ Public and protected endpoints
- ✅ Detailed error handling and logging

## Project Structure
```
azure-oauth-demo/
├── client-app/              # React frontend
│   ├── src/
│   │   ├── App.tsx          # Main UI with login/logout
│   │   ├── authConfig.ts    # MSAL configuration
│   │   └── main.tsx         # App entry point
│   └── package.json
├── protected-api/           # Express backend
│   ├── src/
│   │   ├── index.ts         # API server and endpoints
│   │   └── auth-middleware.ts # JWT validation logic
│   ├── .env.example
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Azure account with an Entra ID tenant (free tier is fine)
- App registration in Entra ID

### Entra ID Setup

1. **Create App Registration:**
   - Go to Azure Portal → Azure Active Directory → App registrations
   - Click "New registration"
   - Name: `OAuth Demo Client`
   - Redirect URI: Single-page application → `http://localhost:5173`
   - Click Register

2. **Note these values:**
   - Application (client) ID
   - Directory (tenant) ID

3. **Expose an API:**
   - In your app registration, click "Expose an API"
   - Add a scope:
     - Scope name: `access_as_user`
     - Who can consent: Admins and users
     - Fill in consent descriptions
     - Click Add scope

4. **Configure API Permissions:**
   - Click "API permissions"
   - Add permissions: Microsoft Graph → Delegated → `User.Read`, `openid`, `profile`, `email`
   - Grant admin consent

### Installation

**Client App:**
```bash
cd client-app
npm install
```

**Protected API:**
```bash
cd protected-api
npm install
cp .env.example .env
```

**Configure `.env`:**
```
TENANT_ID=your-tenant-id-here
CLIENT_ID=your-client-id-here
PORT=3001
```

**Configure `client-app/src/authConfig.ts`:**
```typescript
export const msalConfig: Configuration = {
  auth: {
    clientId: "your-client-id-here",
    authority: "https://login.microsoftonline.com/your-tenant-id-here",
    redirectUri: "http://localhost:5173",
  },
  // ...
};
```

### Running the Application

**Terminal 1 - API Server:**
```bash
cd protected-api
npm run dev
```

**Terminal 2 - Client App:**
```bash
cd client-app
npm run dev
```

Open http://localhost:5173

## Usage Flow

1. **Login** - Click "Login with Microsoft" → Redirected to Entra ID
2. **Authenticate** - Sign in with your Entra ID account
3. **Consent** - Approve requested permissions (first time only)
4. **View Tokens** - See decoded ID token and access token with claims
5. **Call Microsoft Graph** - Test token usage with Microsoft's API
6. **Call Protected API** - Test your own API with token validation

## API Endpoints

### Public
- `GET /api/public` - No authentication required
- `GET /health` - Health check

### Protected (requires valid token)
- `GET /api/protected` - Returns user info from token
- `GET /api/me` - User profile with token metadata
- `GET /api/admin` - Requires `User.Read` scope

## Technical Details

### OAuth 2.0 Flow (Authorization Code + PKCE)

1. Client generates PKCE challenge
2. User redirected to Entra ID authorization endpoint
3. User authenticates and consents
4. Entra ID redirects back with authorization code
5. Client exchanges code for tokens (using PKCE verifier)
6. Client uses access token to call APIs

### JWT Token Validation

The API validates tokens by:
1. Fetching Entra ID public keys from JWKS endpoint
2. Verifying token signature using RS256
3. Validating claims (issuer, audience, expiration)
4. Checking scopes for authorization

### Security Features

- ✅ PKCE prevents authorization code interception
- ✅ Token signature validation ensures authenticity
- ✅ Audience claim prevents token misuse
- ✅ Issuer validation ensures trusted source
- ✅ Expiration checking prevents token reuse
- ✅ HTTPS required in production

## Real-World Applications

This pattern is used for:
- SaaS application authentication
- Microservices authorization
- API gateway integration
- Mobile/web app backends
- Third-party integrations

## What's Different from Enterprise Tools?

At CarMax, I configured PingFederate (the IdP), but this project shows I can:
- Build the client integration from scratch
- Implement token validation without a library
- Understand the protocol, not just the UI
- Debug OAuth flows at the HTTP level

## Future Enhancements

- [ ] Refresh token rotation
- [ ] Token caching strategy
- [ ] Multi-tenant support
- [ ] Role-based access control (RBAC)
- [ ] Logout propagation
- [ ] Docker deployment
- [ ] Integration tests

## Technologies Used

**Client:**
- React 18 + TypeScript
- MSAL.js (Microsoft Authentication Library)
- Vite

**API:**
- Node.js + Express + TypeScript
- jsonwebtoken + jwks-rsa
- dotenv

**Identity Provider:**
- Entra ID / Microsoft Entra ID

## Author

**Joseph Barone**  
Senior Cybersecurity Engineer specializing in Identity and Access Management

- 8+ years enterprise IAM experience
- Expertise: OAuth/OIDC, SAML, SCIM, PingFederate, SailPoint, Entra ID
- [GitHub](https://github.com/jbarone2828)
- [Email](mailto:jbarone2828@gmail.com)

---

*Built as a portfolio project to demonstrate OAuth 2.0 / OIDC protocol knowledge and implementation skills beyond vendor tool configuration.*