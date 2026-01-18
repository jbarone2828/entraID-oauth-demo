import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { validateToken, requireScope } from './auth-middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));
app.use(express.json());

// Public endpoint (no auth required)
app.get('/api/public', (req, res) => {
  res.json({
    message: 'This is a public endpoint - no authentication required',
    timestamp: new Date().toISOString(),
  });
});

// Protected endpoint (requires valid token)
app.get('/api/protected', validateToken, (req, res) => {
  const user = (req as any).user;
  
  res.json({
    message: 'This is a protected endpoint - authentication required',
    user: {
      name: user.name,
      email: user.preferred_username,
      objectId: user.oid,
      tenantId: user.tid,
    },
    tokenInfo: {
      issuer: user.iss,
      audience: user.aud,
      issuedAt: new Date(user.iat * 1000).toISOString(),
      expiresAt: new Date(user.exp * 1000).toISOString(),
    },
    scopes: user.scp?.split(' ') || [],
  });
});

// Protected endpoint with scope requirement
app.get('/api/admin', validateToken, requireScope('User.Read'), (req, res) => {
  const user = (req as any).user;
  
  res.json({
    message: 'This is an admin endpoint - requires User.Read scope',
    user: {
      name: user.name,
      email: user.preferred_username,
    },
    adminData: {
      serverTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// User profile endpoint
app.get('/api/me', validateToken, (req, res) => {
  const user = (req as any).user;
  
  res.json({
    profile: {
      id: user.oid,
      name: user.name,
      email: user.preferred_username,
      roles: user.roles || [],
      scopes: user.scp?.split(' ') || [],
    },
    token: {
      issuedBy: user.iss,
      issuedAt: new Date(user.iat * 1000).toISOString(),
      expiresAt: new Date(user.exp * 1000).toISOString(),
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Azure AD Protected API',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Protected API running on http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`   GET /api/public - No auth required`);
  console.log(`   GET /api/protected - Token required`);
  console.log(`   GET /api/admin - Token + User.Read scope required`);
  console.log(`   GET /api/me - User profile`);
  console.log(`   GET /health - Health check`);
});