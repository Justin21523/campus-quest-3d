// apps/api/src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export type ValidationSchema = {
  params?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  body?: z.ZodTypeAny;
};

/**
 * Express middleware to validate request data against Zod schemas
 * - Mutates req.params/query/body with parsed/coerced values
 * - Returns 400 with structured errors on failure
 */
export function validate(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'ValidationFailed',
          details: error.flatten().fieldErrors,
        });
      } else {
        res.status(400).json({ error: 'InvalidRequest' });
      }
    }
  };
}

// Example usage:
// router.post('/sync', validate({ body: syncDeltaSchema }), handler);