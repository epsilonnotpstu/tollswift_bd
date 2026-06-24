import { Router } from 'express';
import * as controller from '../controllers/toll.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const transactionRoutes = Router();

transactionRoutes.use(requireAuth);
transactionRoutes.get('/', controller.getMyTransactions);
transactionRoutes.get('/:id', controller.getTransaction);
