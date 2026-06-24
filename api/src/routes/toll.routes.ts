import { Router } from 'express';
import * as controller from '../controllers/toll.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { initPaymentSchema } from '../schemas/toll.schema';

export const tollRoutes = Router();

tollRoutes.get('/success', controller.tollSuccess);
tollRoutes.post('/success', controller.tollSuccess);
tollRoutes.get('/calculate', requireAuth, controller.calculateToll);
tollRoutes.post('/pay', requireAuth, validate(initPaymentSchema), controller.initPayment);
