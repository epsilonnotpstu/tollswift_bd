import { NextFunction, Request, Response } from 'express';
import { Role, UserStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { error } from '../utils/response';
import { verifyAccessToken } from '../utils/jwt';

const getToken = (req: Request) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }

  return header.slice('Bearer '.length);
};

const attachUser = async (req: Request, token: string) => {
  const payload = verifyAccessToken(token);
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, status: true }
  });

  if (!user || user.status === UserStatus.BLOCKED) {
    throw new Error('Unauthorized');
  }

  req.user = user;
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = getToken(req);
    if (!token) {
      return error(res, 'Authentication required', 401, 'AUTH_REQUIRED');
    }

    await attachUser(req, token);
    return next();
  } catch {
    return error(res, 'Invalid or expired token', 401, 'INVALID_TOKEN');
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  await requireAuth(req, res, () => {
    if (req.user?.role !== Role.ADMIN) {
      return error(res, 'Admin access required', 403, 'ADMIN_REQUIRED');
    }

    return next();
  });
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = getToken(req);
    if (token) {
      await attachUser(req, token);
    }
  } catch {
    req.user = undefined;
  }

  return next();
};
