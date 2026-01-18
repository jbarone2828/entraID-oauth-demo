import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;

// JWKS client to get Azure AD public keys
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/keys`,
  cache: true,
  cacheMaxAge: 86400000, 
});

// Get signing key from Azure AD
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Middleware to validate Azure AD JWT tokens
export const validateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'No token provided' 
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const decoded = jwt.decode(token, { complete: true });

  // Verify JWT signature and claims
  jwt.verify(
    token,
    getKey,
    {
      audience: 'api://' + clientId,
      issuer: `https://sts.windows.net/${tenantId}/`, 
      algorithms: ['RS256'],
    },
    (err, decoded) => {
      if (err) {
        console.error('Token validation error:', err.message);
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Invalid token',
          details: err.message 
        });
      }

      // Token is valid - attach user info to request
      (req as any).user = decoded;
      console.log('Token validated for user:', (decoded as any)?.name);
      next();
    }
  );
};

// Middleware to check for specific scopes
export const requireScope = (requiredScope: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user || !user.scp) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'No scopes found in token' 
      });
    }

    const scopes = user.scp.split(' ');
    
    if (!scopes.includes(requiredScope)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: `Missing required scope: ${requiredScope}`,
        userScopes: scopes
      });
    }

    next();
  };
};