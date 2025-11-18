# 🚀 EAS Build Setup Guide for LetterLoom

This guide walks you through setting up and building **LetterLoom** using EAS (Expo Application Services) from your Linux development machine.

## 📋 Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**
- **Expo account** (create at https://expo.dev/)
- **Firebase project** (for backend)
- **RevenueCat account** (for in-app purchases)
- **Apple Developer account** ($99/year for iOS builds)
- **Google Play Developer account** ($25 one-time for Android)

## 🎯 Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

## 🔐 Step 2: Login to Expo

```bash
eas login
```

Enter your Expo credentials when prompted.

## 🔧 Step 3: Configure Firebase

### 3.1 Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Follow the setup wizard

### 3.2 Enable Services

- **Authentication**: Enable Anonymous sign-in
- **Firestore**: Create database in production mode
- **Analytics**: (Optional) Enable for user tracking

### 3.3 Get Firebase Config

1. In Firebase Console, go to Project Settings
2. Scroll to "Your apps" section
3. Click "Web" icon to add a web app
4. Copy the Firebase configuration object

### 3.4 Update Firebase Config

Edit `src/services/firebase.ts` and replace the config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

## 💰 Step 4: Configure RevenueCat (IAP)

### 4.1 Create RevenueCat Account

1. Sign up at https://www.revenuecat.com/
2. Create a new project "LetterLoom"

### 4.2 Configure Platforms

#### iOS:
1. In RevenueCat dashboard, go to "App settings"
2. Add iOS app with your bundle ID: `com.letterloom.app`
3. Upload App Store Connect credentials
4. Copy the **iOS API Key**

#### Android:
1. Add Android app with package: `com.letterloom.app`
2. Upload Google Play credentials (service account JSON)
3. Copy the **Android API Key**

### 4.3 Create Products

In RevenueCat, create entitlements and products:

**Entitlements:**
- `level_pack_1` - Level Pack 1
- `level_pack_2` - Level Pack 2
- `level_pack_3` - Level Pack 3
- `premium` - Premium Unlock

**Products** (must match App Store Connect / Google Play Console):
- `com.letterloom.levels.pack1` - $2.99
- `com.letterloom.levels.pack2` - $2.99
- `com.letterloom.levels.pack3` - $2.99
- `com.letterloom.coins.small` - $0.99
- `com.letterloom.coins.medium` - $2.99
- `com.letterloom.coins.large` - $7.99
- `com.letterloom.premium.unlock` - $9.99

### 4.4 Update App Code

Edit `src/App.tsx` to add your RevenueCat API key:

```typescript
// iOS
const REVENUECAT_API_KEY_IOS = 'your_ios_api_key_here';
// Android
const REVENUECAT_API_KEY_ANDROID = 'your_android_api_key_here';

// In initializeApp():
const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
await IAPService.initialize(apiKey);
```

## 🏗️ Step 5: Initialize EAS Project

```bash
eas init
```

This will:
- Create or link an Expo project
- Generate a project ID
- Update `app.json` with the project ID

## 📝 Step 6: Update app.json

Update `app.json` with your information:

```json
{
  "expo": {
    "owner": "your-expo-username",
    "extra": {
      "eas": {
        "projectId": "your-project-id-from-eas-init"
      }
    }
  }
}
```

## 🍎 Step 7: iOS Build Setup

### 7.1 Configure Bundle Identifier

The bundle ID is already set in `app.json` as `com.letterloom.app`.

**Change it** to your own:
```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.letterloom"
  }
}
```

### 7.2 Configure Credentials

EAS can manage your iOS credentials automatically:

```bash
eas credentials
```

Or configure manually in `eas.json` (submit section).

### 7.3 Build iOS App

**Development build** (for testing on device):
```bash
eas build --profile development --platform ios
```

**Production build** (for App Store):
```bash
eas build --profile production --platform ios
```

The build runs on EAS servers (not your local machine), so you can close the terminal.

### 7.4 Download and Test

1. When build completes, you'll get a download URL
2. Download the `.ipa` file (production) or scan QR code (development)
3. Install on device using TestFlight or direct install

## 🤖 Step 8: Android Build Setup

### 8.1 Configure Package Name

The package is set in `app.json` as `com.letterloom.app`.

**Change it** to your own:
```json
{
  "android": {
    "package": "com.yourcompany.letterloom"
  }
}
```

### 8.2 Build Android App

**Development build**:
```bash
eas build --profile development --platform android
```

**Production build** (for Google Play):
```bash
eas build --profile production --platform android
```

### 8.3 Download and Test

1. Download the `.apk` (development) or `.aab` (production)
2. Install on Android device or upload to Google Play Console

## 📦 Step 9: Build Both Platforms

Build iOS and Android simultaneously:

```bash
eas build --profile production --platform all
```

This queues both builds on EAS servers.

## 🚀 Step 10: Submit to App Stores

### iOS (App Store Connect)

1. **First-time setup:**
```bash
eas submit --platform ios
```

2. Follow prompts to:
   - Select the build
   - Enter App Store Connect credentials
   - Submit for review

### Android (Google Play Console)

1. **First-time setup:**
```bash
eas submit --platform android
```

2. Upload the `.aab` file to Google Play Console
3. Complete store listing
4. Submit for review

## 🔄 Step 11: Updates (OTA)

Expo allows Over-The-Air updates for JavaScript changes:

```bash
eas update --branch production --message "Fixed word validation bug"
```

Users get updates automatically without App Store approval!

**Note:** OTA updates only work for JS/assets, not native code changes.

## 📱 Step 12: Local Development

### Start Development Server

```bash
npm start
# or
expo start
```

### Test on Device

1. Install **Expo Go** app from App Store / Google Play
2. Scan QR code from terminal
3. App loads on your device

### Test with Development Build

For testing native features (Firebase, IAP):

1. Build development client:
```bash
eas build --profile development --platform ios
```

2. Install on device
3. Run `expo start --dev-client`
4. App connects to your dev server

## 🐛 Troubleshooting

### Build Fails

**Check logs:**
```bash
eas build:list
```

Click on failed build to see logs.

**Common issues:**
- Missing credentials: Run `eas credentials`
- Invalid bundle ID: Check `app.json`
- Package conflicts: Clear cache with `expo start -c`

### Firebase Not Working

- Verify firebaseConfig in `src/services/firebase.ts`
- Check Firebase Console rules
- Enable required services (Auth, Firestore)

### IAP Not Working

- Verify RevenueCat API keys
- Check product IDs match exactly
- Test with sandbox accounts
- Verify App Store Connect / Play Console setup

## 📊 Monitoring Builds

**View all builds:**
```bash
eas build:list
```

**View specific build:**
```bash
eas build:view [BUILD_ID]
```

**Cancel running build:**
```bash
eas build:cancel
```

## 💾 Environment Variables

For sensitive data, use EAS Secrets:

```bash
eas secret:create --scope project --name FIREBASE_API_KEY --value "your-api-key"
```

Access in code:
```typescript
import Constants from 'expo-constants';
const apiKey = Constants.expoConfig?.extra?.FIREBASE_API_KEY;
```

## 📚 Useful Commands

```bash
# Check EAS project status
eas whoami

# View project info
eas project:info

# Configure app credentials
eas credentials

# Build specific version
eas build --profile production --platform ios --non-interactive

# Auto-submit after build
eas build --profile production --platform ios --auto-submit

# View build queue
eas build:list --status in-queue
```

## 🎨 Asset Requirements

Before building, add these assets to `/assets`:

- `icon.png` - 1024x1024px
- `splash.png` - 1284x2778px
- `adaptive-icon.png` - 1024x1024px (Android)
- `favicon.png` - 48x48px (Web)

Generate with: https://www.appicon.co/

## 🔐 Security Checklist

- [ ] Changed Firebase config from placeholder
- [ ] Added RevenueCat API keys
- [ ] Changed bundle ID / package name
- [ ] Configured Firestore security rules
- [ ] Set up App Store Connect / Play Console
- [ ] Created IAP products in stores
- [ ] Configured RevenueCat products
- [ ] Tested IAP in sandbox mode
- [ ] Added privacy policy URL
- [ ] Added terms of service URL

## 📖 Additional Resources

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **EAS Submit Docs**: https://docs.expo.dev/submit/introduction/
- **Expo Forums**: https://forums.expo.dev/
- **RevenueCat Docs**: https://www.revenuecat.com/docs
- **Firebase Docs**: https://firebase.google.com/docs

## 🎉 Success!

Once configured, you can build and deploy your app entirely from Linux without ever touching Xcode or Android Studio!

Happy building! 🚀
