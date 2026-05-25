import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.goclean.app',
  appName: 'GoClean',
  webDir: 'public',
  server: {
    url: 'https://gocleanair.co',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a5ff0',
      showSpinner: false,
      androidSplashResourceName: 'splash',
    },
  },
};

export default config;
