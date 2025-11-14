import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, Middleware } from '../types/index.js';
import { Response, NextFunction } from 'express';

export const authenticateToken: Middleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    
    if (decoded && typeof decoded === 'object' && 'userId' in decoded && 'email' in decoded) {
      req.user = {
        userId: decoded.userId as number,
        email: decoded.email as string,
      };
      next();
    } else {
      res.status(403).json({ error: 'Invalid token payload' });
      return;
    }
  });
};

