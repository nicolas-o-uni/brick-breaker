import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'brick.breaker',
  appName: 'brick-breaker',
  webDir: 'www',
  plugins: {
    ScreenOrientation: {
      // Trava nativamente pelo manifesto
      orientation: 'portrait',
    }
  }
};

export default config;
