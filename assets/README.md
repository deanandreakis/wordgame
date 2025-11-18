# Assets

## Required Assets

Replace these placeholder files with your actual game assets:

- **icon.png** - App icon (1024x1024px)
- **splash.png** - Splash screen (1284x2778px for iPhone 13 Pro Max)
- **adaptive-icon.png** - Android adaptive icon (1024x1024px)
- **favicon.png** - Web favicon (48x48px)

## Icon Guidelines

### iOS App Icon
- Size: 1024x1024px
- Format: PNG
- No transparency
- No rounded corners (iOS adds them automatically)

### Android Adaptive Icon
- Size: 1024x1024px
- Format: PNG
- Leave 264px safe zone from each edge
- Can have transparency

### Splash Screen
- Size: 1284x2778px (or larger)
- Format: PNG
- Background color: #0F0F1E (as configured in app.json)
- Center your logo/branding

## Generating Icons

Use a tool like:
- https://www.appicon.co/
- https://makeappicon.com/
- Figma/Sketch/Adobe XD

Or use EAS CLI to generate:
```bash
npx expo install expo-splash-screen
npx expo install @expo/configure-splash-screen
```
