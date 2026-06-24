import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tollbd.app',
  appName: 'TollBD',
  webDir: '../web/dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: { style: 'Light', backgroundColor: '#1B4FDB' },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1B4FDB',
      showSpinner: false
    },
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] }
  }
};

export default config;
