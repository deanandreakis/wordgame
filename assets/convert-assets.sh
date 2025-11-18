#!/bin/bash

# Asset Conversion Script for LetterLoom
# Converts SVG assets to PNG format required by Expo

echo "🎨 Converting LetterLoom assets..."

# Check if rsvg-convert is available
if ! command -v rsvg-convert &> /dev/null; then
    echo "⚠️  rsvg-convert not found. Installing..."
    echo "Run: sudo apt-get install librsvg2-bin"
    echo ""
    echo "Alternative: Use online converter at https://cloudconvert.com/svg-to-png"
    echo ""
    echo "Or use ImageMagick:"
    echo "  sudo apt-get install imagemagick"
    echo "  convert icon.svg -resize 1024x1024 icon.png"
    exit 1
fi

# Convert icon (1024x1024)
echo "Converting icon.svg -> icon.png (1024x1024)"
rsvg-convert -w 1024 -h 1024 icon.svg -o icon.png

# Convert splash (1284x2778)
echo "Converting splash.svg -> splash.png (1284x2778)"
rsvg-convert -w 1284 -h 2778 splash.svg -o splash.png

# Convert adaptive icon (1024x1024)
echo "Converting adaptive-icon.svg -> adaptive-icon.png (1024x1024)"
rsvg-convert -w 1024 -h 1024 adaptive-icon.svg -o adaptive-icon.png

# Convert favicon (48x48)
echo "Converting favicon.svg -> favicon.png (48x48)"
rsvg-convert -w 48 -h 48 favicon.svg -o favicon.png

echo "✅ Asset conversion complete!"
echo ""
echo "Generated files:"
echo "  ✓ icon.png (1024x1024)"
echo "  ✓ splash.png (1284x2778)"
echo "  ✓ adaptive-icon.png (1024x1024)"
echo "  ✓ favicon.png (48x48)"
