import webPush from 'web-push';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(`mailto:${env.VAPID_EMAIL}`, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
}

export const generateVapidPublicKey = () => env.VAPID_PUBLIC_KEY;

export const saveSubscription = async (
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string }; platform?: string },
  userAgent?: string
) => {
  return prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
      platform: subscription.platform ?? 'web'
    },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
      platform: subscription.platform ?? 'web'
    }
  });
};

export const removeSubscription = async (endpoint: string) => {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  return { removed: true };
};

const send = async (subscription: { endpoint: string; p256dh: string; auth: string }, payload: PushPayload) => {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    return;
  }

  try {
    await webPush.sendNotification(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
      JSON.stringify(payload)
    );
  } catch (error: unknown) {
    const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error ? error.statusCode : null;
    if (statusCode === 410 || statusCode === 404) {
      await removeSubscription(subscription.endpoint);
    } else {
      logger.warn('Push notification failed', { error });
    }
  }
};

export const sendToUser = async (userId: string, payload: PushPayload) => {
  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  await Promise.all(subscriptions.map((subscription) => send(subscription, payload)));
  return { sent: subscriptions.length };
};

export const sendToAll = async (payload: PushPayload) => {
  const subscriptions = await prisma.pushSubscription.findMany();
  await Promise.all(subscriptions.map((subscription) => send(subscription, payload)));
  return { sent: subscriptions.length };
};
