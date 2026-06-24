import { apiClient, unwrap } from './client';

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  data?: Record<string, unknown>;
}

export const getVapidKey = () => apiClient.get('/notifications/vapid-key').then(unwrap<{ publicKey: string }>);

export const subscribeNotifications = (subscription: PushSubscriptionJSON & { platform?: string }) => {
  return apiClient.post('/notifications/subscribe', subscription).then(unwrap<unknown>);
};

export const unsubscribeNotifications = (endpoint: string) => {
  return apiClient.delete('/notifications/unsubscribe', { data: { endpoint } }).then(unwrap<{ removed: boolean }>);
};

export const broadcast = (payload: PushPayload) => apiClient.post('/admin/notifications/broadcast', payload).then(unwrap<{ sent: number }>);
