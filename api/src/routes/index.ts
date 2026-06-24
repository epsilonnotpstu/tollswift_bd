import { Router } from 'express';
import { adminRoutes } from './admin.routes';
import { authRoutes } from './auth.routes';
import { bridgeRoutes } from './bridge.routes';
import { notificationRoutes } from './notification.routes';
import { qrRoutes } from './qr.routes';
import { tollRoutes } from './toll.routes';
import { transactionRoutes } from './transaction.routes';
import { userRoutes } from './user.routes';
import { vehicleRoutes } from './vehicle.routes';
import { walletRoutes } from './wallet.routes';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);
routes.use('/vehicles', vehicleRoutes);
routes.use('/bridges', bridgeRoutes);
routes.use('/wallet', walletRoutes);
routes.use('/toll', tollRoutes);
routes.use('/transactions', transactionRoutes);
routes.use('/qr', qrRoutes);
routes.use('/notifications', notificationRoutes);
routes.use('/admin', adminRoutes);
