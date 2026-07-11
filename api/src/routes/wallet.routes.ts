import { Router } from 'express';
import * as controller from '../controllers/wallet.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { initDepositSchema } from '../schemas/wallet.schema';

export const walletRoutes = Router();

walletRoutes.get('/deposit/failed', controller.depositFailed);
walletRoutes.post('/deposit/success', controller.depositSuccess);
walletRoutes.get('/deposit/success', controller.depositSuccess);
walletRoutes.get('/', requireAuth, controller.getWallet);
walletRoutes.get('/transactions', requireAuth, controller.getWalletTransactions);
walletRoutes.post('/deposit/init', requireAuth, validate(initDepositSchema), controller.initDeposit);
walletRoutes.post('/deposit/mock-complete', requireAuth, controller.completeMockDeposit);
