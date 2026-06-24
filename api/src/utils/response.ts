import { Response } from 'express';

export const success = <T>(res: Response, data: T, message?: string, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message: message ?? null,
    error: null
  });
};

export const error = (
  res: Response,
  message: string,
  statusCode = 400,
  code?: string,
  details?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    error: {
      code: code ?? 'ERROR',
      details: details ?? null
    }
  });
};
