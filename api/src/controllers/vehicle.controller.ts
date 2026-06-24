import { Request, Response } from 'express';
import { vehicleFilterSchema } from '../schemas/vehicle.schema';
import * as vehicleService from '../services/vehicle.service';
import { success } from '../utils/response';

const getVehicleFiles = (req: Request) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  return {
    frontPhoto: files?.frontPhoto?.[0]?.buffer,
    backPhoto: files?.backPhoto?.[0]?.buffer
  };
};

export const createVehicle = async (req: Request, res: Response) => {
  const files = getVehicleFiles(req);
  const vehicle = await vehicleService.createVehicle(req.user!.id, req.body, files.frontPhoto, files.backPhoto);
  return success(res, vehicle, 'Vehicle submitted for admin verification', 201);
};

export const getMyVehicles = async (req: Request, res: Response) => {
  const vehicles = await vehicleService.getUserVehicles(req.user!.id);
  return success(res, vehicles);
};

export const getVehicle = async (req: Request, res: Response) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id, req.user!.id, req.user!.role);
  return success(res, vehicle);
};

export const updateVehicle = async (req: Request, res: Response) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.user!.id, req.body);
  return success(res, vehicle, 'Vehicle updated');
};

export const deleteVehicle = async (req: Request, res: Response) => {
  const result = await vehicleService.deleteVehicle(req.params.id, req.user!.id);
  return success(res, result, 'Vehicle deleted');
};

export const adminGetPendingVehicles = async (_req: Request, res: Response) => {
  const vehicles = await vehicleService.adminGetPendingVehicles();
  return success(res, vehicles);
};

export const adminGetAllVehicles = async (req: Request, res: Response) => {
  const filters = vehicleFilterSchema.parse(req.query);
  const vehicles = await vehicleService.adminGetAllVehicles(filters);
  return success(res, vehicles);
};

export const adminVerifyVehicle = async (req: Request, res: Response) => {
  const vehicle = await vehicleService.adminVerifyVehicle(req.params.id, req.user!.id, req.body.action, req.body.rejectionReason);
  return success(res, vehicle, 'Vehicle verification updated');
};
