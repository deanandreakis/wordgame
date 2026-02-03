// Load environment variables from .env file (for local development)
// EAS Build will use secrets stored in EAS instead
require('dotenv').config();

module.exports = {
  expo: {
    name: 'LetterLoom',
    slug: 'letterloom',
    version: '1.1.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0F0F1E',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.letterloom.app',
      buildNumber: '2',
      infoPlist: {
        UIBackgroundModes: [],
      },
      config: {
        usesNonExemptEncryption: false,
      },
      entitlements: {
        'com.apple.developer.game-center': true,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#0F0F1E',
      },
      package: 'com.letterloom.app',
      versionCode: 1,
      permissions: [],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-secure-store',
      'expo-font',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
        },
      ],
    ],
    extra: {
      eas: {
        projectId: process.env.EXPO_PROJECT_ID || 'your-project-id-here',
      },
      // Note: RevenueCat API keys are injected via src/config/secrets.ts during CI/CD builds
    },
    owner: process.env.EXPO_OWNER || 'your-expo-username',
  },
};
