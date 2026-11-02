/**
 * Script to generate PWA icons using Canvas API (Node.js)
 * Run: node scripts/generate-icons.mjs
 */

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const OUTPUT_DIR = join(process.cwd(), 'public', 'icons');

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const size of SIZES) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, size, size);
  bgGrad.addColorStop(0, '#0f0b1e');
  bgGrad.addColorStop(1, '#08090d');
  ctx.fillStyle = bgGrad;
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  // Inner gradient circle
  const circleSize = size * 0.55;
  const cx = size / 2;
  const cy = size / 2;
  const grad = ctx.createLinearGradient(cx - circleSize / 2, cy - circleSize / 2, cx + circleSize / 2, cy + circleSize / 2);
  grad.addColorStop(0, '#7c3aed');
  grad.addColorStop(1, '#06b6d4');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, circleSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // "AI" text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.round(size * 0.28)}px -apple-system, BlinkMacSystemFont, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI', cx, cy);

  const buffer = canvas.toBuffer('image/png');
  writeFileSync(join(OUTPUT_DIR, `icon-${size}x${size}.png`), buffer);
  console.log(`✓ Generated icon-${size}x${size}.png`);
}

console.log('\nAll icons generated successfully!');
