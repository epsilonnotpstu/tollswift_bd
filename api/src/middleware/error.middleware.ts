import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { error } from '../utils/response';

export const errorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return error(res, 'Duplicate record found', 409, 'UNIQUE_CONSTRAINT', err.meta);
    }

    if (err.code === 'P2025') {
      return error(res, 'Record not found', 404, 'NOT_FOUND', err.meta);
    }
  }

  if (err instanceof ZodError) {
    return error(res, 'Validation failed', 400, 'VALIDATION_ERROR', err.flatten());
  }

  if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
    return error(res, 'Invalid or expired token', 401, 'INVALID_TOKEN');
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';

  if (statusCode >= 500) {
    logger.error(message, { err });
  }

  return error(res, statusCode >= 500 ? 'Internal server error' : message, statusCode, code);
};

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code = 'APP_ERROR'
  ) {
    super(message);
  }
}
