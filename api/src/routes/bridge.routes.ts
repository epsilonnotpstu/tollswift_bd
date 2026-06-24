import { Router } from 'express';
import * as controller from '../controllers/bridge.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const bridgeRoutes = Router();

bridgeRoutes.use(requireAuth);
bridgeRoutes.get('/search', controller.searchBridges);
bridgeRoutes.get('/', controller.getAllBridges);
bridgeRoutes.get('/:id', controller.getBridgeById);
