import { Router } from 'express';
import * as controller from '../controllers/vehicle.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { vehiclePhotoUpload } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { createVehicleSchema, updateVehicleSchema } from '../schemas/vehicle.schema';

export const vehicleRoutes = Router();

vehicleRoutes.use(requireAuth);
vehicleRoutes.post('/', vehiclePhotoUpload, validate(createVehicleSchema), controller.createVehicle);
vehicleRoutes.get('/', controller.getMyVehicles);
vehicleRoutes.get('/:id', controller.getVehicle);
vehicleRoutes.patch('/:id', validate(updateVehicleSchema), controller.updateVehicle);
vehicleRoutes.delete('/:id', controller.deleteVehicle);
