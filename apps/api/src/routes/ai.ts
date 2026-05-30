import { Router } from 'express';
import type { HealthCheckResponse } from '@campus-quest/shared-types';

const router = Router();

function isHealthCheckResponse(value: unknown): value is HealthCheckResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<HealthCheckResponse>;

  return (
    typeof candidate.service === 'string' &&
    typeof candidate.status === 'string' &&
    typeof candidate.timestamp === 'string'
  );
}

/**
 * Proxies a health check request from the Node.js API to the Python AI service.
 *
 * This confirms that the backend can communicate with the AI service.
 */
router.get('/health', async (_req, res) => {
  const aiServiceUrl = process.env.AI_SERVICE_URL ?? 'http://localhost:8001';

  try {
    const response = await fetch(`${aiServiceUrl}/health`);
    const data: unknown = await response.json();

    const aiServiceStatus = isHealthCheckResponse(data)
      ? data.status
      : 'unknown';

    res.json({
      service: 'campus-quest-api-ai-proxy',
      status: 'ok',
      timestamp: new Date().toISOString(),
      dependencies: {
        aiService: aiServiceStatus,
      },
      aiService: data,
    });
  } catch (error) {
    res.status(502).json({
      service: 'campus-quest-api-ai-proxy',
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Unable to reach AI service.',
      error: error instanceof Error ? error.message : String(error),
      dependencies: {
        aiService: 'error',
      },
    });
  }
});

export default router;
