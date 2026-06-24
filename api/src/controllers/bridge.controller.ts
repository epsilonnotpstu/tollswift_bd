import { Request, Response } from 'express';
import { bridgeFilterSchema, calculateQuerySchema } from '../schemas/bridge.schema';
import * as bridgeService from '../services/bridge.service';
import { success } from '../utils/response';

export const getAllBridges = async (req: Request, res: Response) => {
  const filters = bridgeFilterSchema.parse(req.query);
  const bridges = await bridgeService.getAllBridges(filters);
  return success(res, bridges);
};

export const getBridgeById = async (req: Request, res: Response) => {
  const bridge = await bridgeService.getBridgeById(req.params.id);
  return success(res, bridge);
};

export const searchBridges = async (req: Request, res: Response) => {
  const bridges = await bridgeService.searchBridges(String(req.query.q ?? ''));
  return success(res, bridges);
};

export const calculateToll = async (req: Request, res: Response) => {
  const query = calculateQuerySchema.parse(req.query);
  const amount = await bridgeService.getTollRateForVehicle(query.bridgeId, query.category);
  return success(res, { amount, amountTaka: amount / 100 });
};

export const adminCreateBridge = async (req: Request, res: Response) => {
  const bridge = await bridgeService.adminCreateBridge(req.body, req.user!.id);
  return success(res, bridge, 'Bridge created', 201);
};

export const adminUpdateBridge = async (req: Request, res: Response) => {
  const bridge = await bridgeService.adminUpdateBridge(req.params.id, req.body);
  return success(res, bridge, 'Bridge updated');
};

export const adminToggleStatus = async (req: Request, res: Response) => {
  const bridge = await bridgeService.adminToggleStatus(req.params.id);
  return success(res, bridge, 'Bridge status updated');
};

export const adminUpdateTollRate = async (req: Request, res: Response) => {
  const tollRate = await bridgeService.adminUpdateTollRate(req.params.id, req.body, req.user!.id);
  return success(res, tollRate, 'Toll rates updated');
};
