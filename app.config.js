// Load environment variables from .env file (for local development)
// EAS Build will use secrets stored in EAS instead
require('dotenv').config();

module.exports = {
  expo: {
    name: 'LetterLoom',
    slug: 'letterloom',
    version: '1.0.0',
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
      buildNumber: '1',
      infoPlist: {
        UIBackgroundModes: [],
        NSUserTrackingUsageDescription:
          'This identifier will be used to deliver personalized ads to you.',
      },
      config: {
        usesNonExemptEncryption: false,
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
      // Firebase configuration - accessible via expo-constants
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
      },
      // RevenueCat API keys - accessible via expo-constants
      revenueCat: {
        iosApiKey: process.env.REVENUECAT_IOS_API_KEY,
        androidApiKey: process.env.REVENUECAT_ANDROID_API_KEY,
      },
    },
    owner: process.env.EXPO_OWNER || 'your-expo-username',
  },
};
