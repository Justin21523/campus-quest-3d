// apps/api/src/middleware/rateLimit.ts
import { Request, Response, NextFunction } from 'express';

export interface RateLimitOptions {
  windowMs: number;        // Time window in milliseconds
  maxRequests: number;     // Max requests per window
  keyGenerator?: (req: Request) => string; // Custom key (default: IP + playerId)
  message?: string;        // Response message when limited
  skipFailedRequests?: boolean; // Don't count 4xx/5xx responses
}

interface RateLimitEntry {
  count: number;
  firstRequest: number;
}

// In-memory store (use Redis for production)
const store = new Map<string, RateLimitEntry>();

/**
 * Rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => {
      // Combine IP and playerId for per-player limits
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const playerId = (req as any).playerId || 'anonymous';
      return `${ip}:${playerId}`;
    },
    message = 'Too many requests, please try again later',
    skipFailedRequests = false,
  } = options;

  // Cleanup old entries periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now - entry.firstRequest > windowMs) {
        store.delete(key);
      }
    }
  }, Math.min(windowMs, 60000));

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    let entry = store.get(key);
    
    // Initialize or reset window
    if (!entry || now - entry.firstRequest > windowMs) {
      entry = { count: 1, firstRequest: now };
      store.set(key, entry);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }
    
    // Increment count
    entry.count++;
    
    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - entry.count);
    const resetTime = Math.ceil((entry.firstRequest + windowMs) / 1000);
    
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetTime);
    
    // Check if limit exceeded
    if (entry.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil((entry.firstRequest + windowMs - now) / 1000));
      return res.status(429).json({ error: message });
    }
    
    // Track failed requests if enabled
    if (skipFailedRequests) {
      const originalSend = res.send.bind(res);
      res.send = function (body) {
        const statusCode = res.statusCode;
        if (statusCode >= 400) {
          // Decrement count for failed requests
          entry!.count = Math.max(1, entry!.count - 1);
        }
        return originalSend(body);
      };
    }
    
    next();
  };
}

/**
 * Pre-configured limiters for common endpoints
 */
export const limiters = {
  // Strict limit for sync endpoints (prevent spam)
  sync: rateLimit({
    windowMs: 1000,    // 1 second
    maxRequests: 5,    // 5 requests/sec per player
    message: 'Sync rate exceeded',
  }),
  
  // Moderate limit for quest transitions
  quest: rateLimit({
    windowMs: 5000,    // 5 seconds
    maxRequests: 10,   // 10 requests/5sec
    message: 'Quest actions rate exceeded',
  }),
  
  // Loose limit for read endpoints
  read: rateLimit({
    windowMs: 1000,    // 1 second
    maxRequests: 30,   // 30 requests/sec
    message: 'Read rate exceeded',
  }),
};