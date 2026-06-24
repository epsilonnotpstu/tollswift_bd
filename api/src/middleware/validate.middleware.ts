import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { error } from '../utils/response';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message
    }));

    return error(res, 'Validation failed', 400, 'VALIDATION_ERROR', details);
  }

  req.body = parsed.data;
  return next();
};
