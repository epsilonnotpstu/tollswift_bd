import { CapacitorConfig } from '@capacitor/cli';

// DEV: set to true when testing on physical device (uses live server via IP)
// PROD: set to false (uses bundled web dist)
const DEV_MODE = true;
const DEV_SERVER_IP = '10.143.177.1'; // your PC's local IP

const config: CapacitorConfig = {
  appId: 'com.tollbd.app',
  appName: 'TollBD',
  webDir: '../web/dist',
  server: DEV_MODE ? {
    url: `http://${DEV_SERVER_IP}:5173`,
    cleartext: true
  } : {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: { style: 'Light', backgroundColor: '#1B4FDB' },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1B4FDB',
      showSpinner: false
    },
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '259890151181-6l2fcu87fd7c7pelj7129sf5vtvio0pp.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    }
  }
};

export default config;
