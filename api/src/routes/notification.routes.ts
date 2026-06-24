import { Router } from 'express';
import * as controller from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { subscriptionSchema, unsubscribeSchema } from '../schemas/notification.schema';

export const notificationRoutes = Router();

notificationRoutes.get('/vapid-key', controller.vapidKey);
notificationRoutes.post('/subscribe', requireAuth, validate(subscriptionSchema), controller.subscribe);
notificationRoutes.delete('/unsubscribe', requireAuth, validate(unsubscribeSchema), controller.unsubscribe);
