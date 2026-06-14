// apps/api/src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  playerId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_prod';
const SKIP_AUTH = process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH === 'true';

/**
 * Optional JWT auth middleware
 * - Dev: skips if SKIP_AUTH=true
 * - Prod: requires valid Bearer token
 */
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (SKIP_AUTH) {
    // Dev mode: extract playerId from header or query (insecure, for testing only)
    req.playerId = req.headers['x-player-id'] as string || req.query.playerId as string;
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  
  try {
    const token = authHeader.substring(7);
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; playerId: string };
    req.userId = payload.sub;
    req.playerId = payload.playerId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Generate JWT for player (call after login/registration)
 */
export const generatePlayerToken = (playerId: string, userId?: string): string => {
  return jwt.sign(
    { sub: userId || `player_${playerId}`, playerId },
    JWT_SECRET,
    { expiresIn: '7d', issuer: 'campus-quest-api' }
  );
};

/**
 * Verify token without extracting (for health checks)
 */
export const verifyToken = (token: string): boolean => {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
};