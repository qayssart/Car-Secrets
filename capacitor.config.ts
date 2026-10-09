import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.asrar.alsayarat',
  appName: 'أسرار السيارات',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
};

export default config;
