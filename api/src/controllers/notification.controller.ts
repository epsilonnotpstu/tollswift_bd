import { Request, Response } from 'express';
import * as pushService from '../services/push.service';
import { success } from '../utils/response';

export const vapidKey = async (_req: Request, res: Response) => {
  return success(res, { publicKey: pushService.generateVapidPublicKey() });
};

export const subscribe = async (req: Request, res: Response) => {
  const subscription = await pushService.saveSubscription(req.user!.id, req.body, req.headers['user-agent']);
  return success(res, subscription, 'Subscription saved', 201);
};

export const unsubscribe = async (req: Request, res: Response) => {
  const result = await pushService.removeSubscription(req.body.endpoint);
  return success(res, result, 'Subscription removed');
};

export const broadcast = async (req: Request, res: Response) => {
  const result = await pushService.sendToAll(req.body);
  return success(res, result, 'Broadcast sent');
};
