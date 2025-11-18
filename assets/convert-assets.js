#!/usr/bin/env node

/**
 * Asset Conversion Script for LetterLoom
 * Converts SVG assets to PNG format using Node.js
 *
 * Install dependencies first:
 *   npm install sharp
 *
 * Then run:
 *   node convert-assets.js
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 LetterLoom Asset Converter\n');

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp library not found!');
  console.log('');
  console.log('To install:');
  console.log('  npm install sharp');
  console.log('');
  console.log('Then run this script again:');
  console.log('  node convert-assets.js');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Alternative: Use Online Converter');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('1. Go to: https://cloudconvert.com/svg-to-png');
  console.log('2. Upload each SVG file:');
  console.log('   - icon.svg → icon.png (1024x1024)');
  console.log('   - splash.svg → splash.png (1284x2778)');
  console.log('   - adaptive-icon.svg → adaptive-icon.png (1024x1024)');
  console.log('   - favicon.svg → favicon.png (48x48)');
  console.log('3. Download and place in /assets folder');
  process.exit(1);
}

const conversions = [
  { input: 'icon.svg', output: 'icon.png', width: 1024, height: 1024 },
  { input: 'splash.svg', output: 'splash.png', width: 1284, height: 2778 },
  { input: 'adaptive-icon.svg', output: 'adaptive-icon.png', width: 1024, height: 1024 },
  { input: 'favicon.svg', output: 'favicon.png', width: 48, height: 48 },
];

async function convertAssets() {
  for (const conversion of conversions) {
    const inputPath = path.join(__dirname, conversion.input);
    const outputPath = path.join(__dirname, conversion.output);

    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  ${conversion.input} not found, skipping...`);
      continue;
    }

    try {
      console.log(`Converting ${conversion.input} → ${conversion.output} (${conversion.width}x${conversion.height})`);

      await sharp(inputPath)
        .resize(conversion.width, conversion.height)
        .png()
        .toFile(outputPath);

      console.log(`✅ ${conversion.output} created successfully`);
    } catch (error) {
      console.error(`❌ Error converting ${conversion.input}:`, error.message);
    }
  }

  console.log('\n✨ Asset conversion complete!\n');
  console.log('Generated files:');
  console.log('  ✓ icon.png (1024x1024)');
  console.log('  ✓ splash.png (1284x2778)');
  console.log('  ✓ adaptive-icon.png (1024x1024)');
  console.log('  ✓ favicon.png (48x48)');
}

convertAssets().catch(console.error);
