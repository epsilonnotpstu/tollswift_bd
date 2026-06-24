import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import * as notificationApi from '@/api/notifications.api';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

export const usePushNotification = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const subscribe = async () => {
    if (Capacitor.isNativePlatform()) {
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== 'granted') {
        return false;
      }
      await PushNotifications.register();
      setIsSubscribed(true);
      return true;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    const { publicKey } = await notificationApi.getVapidKey();
    if (!publicKey) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    await notificationApi.subscribeNotifications(subscription.toJSON());
    setIsSubscribed(true);
    return true;
  };

  const unsubscribe = async () => {
    if (!('serviceWorker' in navigator)) {
      setIsSubscribed(false);
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await notificationApi.unsubscribeNotifications(subscription.endpoint);
      await subscription.unsubscribe();
    }
    setIsSubscribed(false);
  };

  return { isSubscribed, subscribe, unsubscribe };
};
