import { CapacitorConfig } from '@capacitor/cli';

// DEV_MODE=true → app loads from live web server via ADB reverse tunnel (hot reload)
// DEV_MODE=false → app uses bundled web/dist (standalone APK, no laptop needed)
const DEV_MODE = false;

const config: CapacitorConfig = {
  appId: 'com.tollbd.app',
  appName: 'TollBD',
  webDir: '../web/dist',
  server: DEV_MODE ? {
    // ADB reverse maps phone's localhost → laptop's localhost
    // Run: adb reverse tcp:5173 tcp:5173 && adb reverse tcp:3001 tcp:3001
    url: 'http://localhost:5173',
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
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] }
  }
};

export default config;
