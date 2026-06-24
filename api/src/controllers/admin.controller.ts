import { Request, Response } from 'express';
import { Prisma, TransactionType, UserStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { announcementSchema, revenueQuerySchema, usersQuerySchema } from '../schemas/admin.schema';
import { success } from '../utils/response';

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const dashboardStats = async (_req: Request, res: Response) => {
  const today = startOfToday();
  const [todayAgg, todayTransactionCount, totalActiveUsers, pendingVehicleCount, paymentGroups] = await Promise.all([
    prisma.transaction.aggregate({
      where: { createdAt: { gte: today }, status: 'SUCCESS', type: 'TOLL_PAYMENT' },
      _sum: { amount: true }
    }),
    prisma.transaction.count({ where: { createdAt: { gte: today }, status: 'SUCCESS', type: 'TOLL_PAYMENT' } }),
    prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
    prisma.vehicle.count({ where: { status: 'PENDING' } }),
    prisma.transaction.groupBy({
      by: ['paymentMethod'],
      where: { status: 'SUCCESS', type: 'TOLL_PAYMENT' },
      _count: { _all: true }
    })
  ]);

  const weeklyRevenue = await Promise.all(
    Array.from({ length: 7 }).map(async (_, index) => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (6 - index));
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const aggregate = await prisma.transaction.aggregate({
        where: { createdAt: { gte: start, lt: end }, status: 'SUCCESS', type: 'TOLL_PAYMENT' },
        _sum: { amount: true }
      });
      return { date: start.toISOString().slice(0, 10), amountPaisa: aggregate._sum.amount ?? 0 };
    })
  );

  const paymentMethodBreakdown = { WALLET: 0, SSLCOMMERZ: 0, BKASH: 0, NAGAD: 0, CARD: 0 };
  for (const group of paymentGroups) {
    paymentMethodBreakdown[group.paymentMethod] = group._count._all;
  }

  return success(res, {
    todayRevenuePaisa: todayAgg._sum.amount ?? 0,
    todayTransactionCount,
    totalActiveUsers,
    pendingVehicleCount,
    weeklyRevenue,
    paymentMethodBreakdown
  });
};

export const getUsers = async (req: Request, res: Response) => {
  const query = usersQuerySchema.parse(req.query);
  const where: Prisma.UserWhereInput = {
    status: query.status,
    OR: query.search
      ? [
          { email: { contains: query.search, mode: 'insensitive' } },
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } }
        ]
      : undefined
  };
  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        wallet: { select: { balance: true } },
        _count: { select: { vehicles: true, transactions: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: query.limit
    }),
    prisma.user.count({ where })
  ]);

  return success(res, { items, total, page: query.page, limit: query.limit });
};

export const getUserById = async (req: Request, res: Response) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.params.id },
    select: {
      id: true, email: true, phone: true, fullName: true, photoUrl: true,
      role: true, status: true, emailVerified: true, division: true, district: true,
      emergencyContact: true, nidNumber: true, createdAt: true, updatedAt: true,
      wallet: { select: { balance: true } },
      _count: { select: { vehicles: true, transactions: true } },
      vehicles: { select: { id: true, registrationNumber: true, vehicleType: true, vehicleCategory: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' } },
      transactions: { where: { type: 'TOLL_PAYMENT' }, select: { id: true, amount: true, bridgeName: true, vehiclePlate: true, status: true, paymentMethod: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 10 }
    }
  });
  return success(res, user);
};

export const blockUser = async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { status: req.body.blocked ? 'BLOCKED' : 'ACTIVE' },
    select: { id: true, email: true, fullName: true, status: true }
  });
  return success(res, user, req.body.blocked ? 'User blocked' : 'User unblocked');
};

export const revenueStats = async (req: Request, res: Response) => {
  const query = revenueQuerySchema.parse(req.query);
  const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = query.to ? new Date(query.to) : new Date();
  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: from, lte: to }, status: 'SUCCESS', type: TransactionType.TOLL_PAYMENT },
    select: { amount: true, createdAt: true }
  });
  const buckets = new Map<string, number>();
  for (const transaction of transactions) {
    const key =
      query.groupBy === 'month'
        ? transaction.createdAt.toISOString().slice(0, 7)
        : transaction.createdAt.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + transaction.amount);
  }
  return success(res, Array.from(buckets.entries()).map(([date, amountPaisa]) => ({ date, amountPaisa })));
};

export const getAnnouncements = async (_req: Request, res: Response) => {
  const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  return success(res, announcements);
};

export const createAnnouncement = async (req: Request, res: Response) => {
  const body = announcementSchema.parse(req.body);
  const announcement = await prisma.announcement.create({
    data: {
      ...body,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      createdById: req.user!.id
    }
  });
  return success(res, announcement, 'Announcement created', 201);
};
