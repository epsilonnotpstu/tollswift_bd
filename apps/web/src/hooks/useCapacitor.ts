import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';

export const useCapacitor = () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  const takePhoto = async () => {
    if (!isNative) {
      return null;
    }

    return Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 80
    });
  };

  const shareContent = async (title: string, text: string, url?: string) => {
    if (isNative) {
      await Share.share({ title, text, url });
      return;
    }

    if (navigator.share) {
      await navigator.share({ title, text, url });
    }
  };

  const vibrate = async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if ('vibrate' in navigator) {
      navigator.vibrate(80);
    }
  };

  return {
    isNative,
    platform,
    takePhoto,
    shareContent,
    openShare: shareContent,
    vibrate
  };
};
