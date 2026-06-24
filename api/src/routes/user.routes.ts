import { Router } from 'express';
import * as controller from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { profilePhotoUpload } from '../middleware/upload.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateMeSchema } from '../schemas/user.schema';

export const userRoutes = Router();

userRoutes.use(requireAuth);
userRoutes.get('/me', controller.getMe);
userRoutes.patch('/me', validate(updateMeSchema), controller.updateMe);
userRoutes.post('/me/photo', profilePhotoUpload, controller.uploadPhoto);
userRoutes.delete('/me', controller.deleteMe);
