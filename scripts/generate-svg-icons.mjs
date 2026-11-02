/**
 * Script to generate SVG placeholder icons for PWA
 * These are functional SVG icons that can be used directly or converted to PNG
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = join(process.cwd(), 'public', 'icons');

mkdirSync(OUTPUT_DIR, { recursive: true });

function generateSVG(size) {
  const radius = Math.round(size * 0.22);
  const circleR = Math.round(size * 0.275);
  const cx = size / 2;
  const cy = size / 2;
  const fontSize = Math.round(size * 0.28);
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="${size}" y2="${size}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f0b1e"/>
      <stop offset="100%" stop-color="#08090d"/>
    </linearGradient>
    <linearGradient id="circle" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <clipPath id="rounded">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}"/>
    </clipPath>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#bg)"/>
  <circle cx="${cx}" cy="${cy}" r="${circleR}" fill="url(#circle)"/>
  <text x="${cx}" y="${cy}" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" 
        font-weight="bold" font-size="${fontSize}" 
        fill="white" text-anchor="middle" dominant-baseline="central">AI</text>
</svg>`;
}

for (const size of SIZES) {
  const svg = generateSVG(size);
  writeFileSync(join(OUTPUT_DIR, `icon-${size}x${size}.svg`), svg);
  console.log(`✓ Generated icon-${size}x${size}.svg`);
}

console.log('\nAll SVG icons generated!');
console.log('Note: For production PNG icons, run: node scripts/generate-icons.mjs (requires canvas package)');
