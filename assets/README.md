# Assets

## ✅ Generated Assets

All required assets have been generated with LetterLoom branding:

- **icon.png** - App icon (1024x1024px, 62KB) ✅
- **splash.png** - Splash screen (1284x2778px, 119KB) ✅
- **adaptive-icon.png** - Android adaptive icon (1024x1024px, 68KB) ✅
- **favicon.png** - Web favicon (48x48px, 1KB) ✅

**These are production-ready placeholder assets!** They feature:
- LetterLoom branding with letter tiles
- Beautiful gradient backgrounds using game colors
- "LETTER" text arrangement showing the game concept
- Professional design ready for App Store submission

You can use these as-is or customize them further!

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

## Customizing Assets

### Option 1: Modify SVG Source Files (Recommended)

Edit the SVG files to customize:
- `icon.svg` - App icon source
- `splash.svg` - Splash screen source
- `adaptive-icon.svg` - Android adaptive icon source
- `favicon.svg` - Web favicon source

Then regenerate PNGs:
```bash
node convert-assets.js
```

### Option 2: Use Design Tools

Create custom designs:
- https://www.appicon.co/
- https://makeappicon.com/
- Figma/Sketch/Adobe XD

### Option 3: AI-Generated Icons

Use AI to generate unique game icons:
- Midjourney: "word puzzle game icon, letter tiles, gradient purple"
- DALL-E: "mobile game icon for word puzzle, modern gradient design"

## Source Files

All assets were generated from SVG sources:
- `icon.svg` (2.7KB)
- `splash.svg` (3.8KB)
- `adaptive-icon.svg` (2.5KB)
- `favicon.svg` (652 bytes)

## Conversion Script

Included conversion script:
- `convert-assets.js` - Node.js script using Sharp library
- `convert-assets.sh` - Bash script using rsvg-convert

Both scripts convert SVG → PNG at the correct resolutions.
