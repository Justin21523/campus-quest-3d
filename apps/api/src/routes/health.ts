import { Router } from 'express';
import type { HealthCheckResponse } from '@campus-quest/shared-types';

const router = Router();

/**
 * Health check endpoint for the Node.js API service.
 *
 * The response shape is shared with the frontend through
 * @campus-quest/shared-types.
 */
router.get('/', (_req, res) => {
  const response: HealthCheckResponse = {
    service: 'campus-quest-api',
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    environment: process.env.NODE_ENV ?? 'development',
    dependencies: {
      aiService: 'unknown',
      database: 'unknown',
    },
  };

  res.json(response);
});

export default router;
