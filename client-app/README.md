# OAuth Client Application

React application demonstrating OAuth 2.0 Authorization Code flow with PKCE and OpenID Connect.

## Features

- Azure AD authentication using MSAL.js
- PKCE (Proof Key for Code Exchange) for enhanced security
- JWT token decoding and visualization
- Microsoft Graph API integration
- Protected API calls with bearer tokens

## Configuration

Edit `src/authConfig.ts`:
```typescript
export const msalConfig: Configuration = {
  auth: {
    clientId: "YOUR_CLIENT_ID",
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    redirectUri: "http://localhost:5173",
  },
  // ...
};
```

## Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```
