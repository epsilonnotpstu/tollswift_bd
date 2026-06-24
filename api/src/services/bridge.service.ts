import { BridgeCategory, BridgeStatus, Prisma, VehicleCategory } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

const includeRate = { tollRate: true };

const rateField = (category: VehicleCategory) => `rate${category}` as keyof Pick<Prisma.TollRateCreateInput, 'rateA' | 'rateB' | 'rateC' | 'rateD' | 'rateE' | 'rateF'>;

export const getAllBridges = (filters?: { category?: BridgeCategory; status?: BridgeStatus }) => {
  return prisma.bridge.findMany({
    where: { category: filters?.category, status: filters?.status },
    include: includeRate,
    orderBy: { name: 'asc' }
  });
};

export const getBridgeById = async (id: string) => {
  const bridge = await prisma.bridge.findUnique({ where: { id }, include: includeRate });
  if (!bridge) {
    throw new AppError('Bridge not found', 404, 'BRIDGE_NOT_FOUND');
  }
  return bridge;
};

export const searchBridges = (query: string) => {
  return prisma.bridge.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { nameBn: { contains: query, mode: 'insensitive' } },
        { district: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: includeRate,
    orderBy: { name: 'asc' }
  });
};

export const adminCreateBridge = async (data: Prisma.BridgeCreateInput, adminId: string) => {
  return prisma.bridge.create({
    data: {
      ...data,
      tollRate: {
        create: {
          rateA: 10000,
          rateB: 75000,
          rateC: 120000,
          rateD: 200000,
          rateE: 160000,
          rateF: 280000,
          updatedById: adminId
        }
      }
    },
    include: includeRate
  });
};

export const adminUpdateBridge = (id: string, data: Prisma.BridgeUpdateInput) => {
  return prisma.bridge.update({ where: { id }, data, include: includeRate });
};

export const adminToggleStatus = async (id: string) => {
  const bridge = await getBridgeById(id);
  const status = bridge.status === BridgeStatus.ACTIVE ? BridgeStatus.MAINTENANCE : BridgeStatus.ACTIVE;
  return prisma.bridge.update({ where: { id }, data: { status }, include: includeRate });
};

export const adminUpdateTollRate = (bridgeId: string, rates: Omit<Prisma.TollRateUncheckedCreateInput, 'id' | 'bridgeId' | 'updatedById'>, adminId: string) => {
  return prisma.tollRate.upsert({
    where: { bridgeId },
    update: { ...rates, updatedById: adminId },
    create: { bridgeId, ...rates, updatedById: adminId }
  });
};

export const getTollRateForVehicle = async (bridgeId: string, category: VehicleCategory) => {
  const bridge = await prisma.bridge.findUnique({ where: { id: bridgeId }, include: includeRate });
  if (!bridge) {
    throw new AppError('Bridge not found', 404, 'BRIDGE_NOT_FOUND');
  }
  if (bridge.status !== BridgeStatus.ACTIVE) {
    throw new AppError('Bridge is not active', 400, 'BRIDGE_NOT_ACTIVE');
  }
  if (!bridge.tollRate) {
    throw new AppError('Toll rate is not configured', 404, 'TOLL_RATE_NOT_FOUND');
  }

  return bridge.tollRate[rateField(category)] as number;
};
