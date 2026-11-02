import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { deflateSync } from 'zlib';

const PROJECT_DIR = 'C:\\Users\\porca\\.gemini\\antigravity\\scratch\\ai-briefing-pwa';
const OUTPUT_DIR = join(PROJECT_DIR, 'public', 'icons');
mkdirSync(OUTPUT_DIR, { recursive: true });

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Generates a PNG Buffer with dark glass background, neon violet-cyan gradient circle and white "AI" style
function generatePng(size) {
  const width = size;
  const height = size;
  
  // Raw scanlines: each scanline starts with filter byte 0
  const rowStride = 1 + width * 4;
  const raw = Buffer.alloc(height * rowStride);

  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = size * 0.44;
  const innerRadius = size * 0.36;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    raw[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: Deep dark #08090d with slight violet gradient
      const bgT = (x + y) / (width + height);
      let r = Math.round(8 + bgT * 12);
      let g = Math.round(9 + bgT * 8);
      let b = Math.round(13 + bgT * 26);
      let a = 255;

      // Glow circle
      if (dist <= outerRadius) {
        // Gradient from Violet (#7c3aed: 124, 58, 237) to Cyan (#06b6d4: 6, 182, 212)
        const t = (dx + dy) / (2 * outerRadius) + 0.5;
        const clampedT = Math.max(0, Math.min(1, t));
        const circleR = Math.round(124 * (1 - clampedT) + 6 * clampedT);
        const circleG = Math.round(58 * (1 - clampedT) + 182 * clampedT);
        const circleB = Math.round(237 * (1 - clampedT) + 212 * clampedT);

        if (dist <= innerRadius) {
          // Inside core
          r = circleR;
          g = circleG;
          b = circleB;

          // Simple raster "A I" shape highlight in center
          const relX = (x - cx) / innerRadius;
          const relY = (y - cy) / innerRadius;
          // White emblem badge in center
          if (Math.abs(relX) < 0.45 && Math.abs(relY) < 0.45) {
            // Draw stylized core
            const emblemDist = Math.sqrt(relX * relX + relY * relY);
            if (emblemDist < 0.35) {
              const blend = Math.min(1, Math.max(0, (0.35 - emblemDist) * 8));
              r = Math.round(r * (1 - blend) + 255 * blend);
              g = Math.round(g * (1 - blend) + 255 * blend);
              b = Math.round(b * (1 - blend) + 255 * blend);
            }
          }
        } else {
          // Antialiased border of circle
          const edge = (outerRadius - dist) / (outerRadius - innerRadius);
          r = Math.round(r * (1 - edge) + circleR * edge);
          g = Math.round(g * (1 - edge) + circleG * edge);
          b = Math.round(b * (1 - edge) + circleB * edge);
        }
      }

      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // filter adaptive
  ihdrData[12] = 0; // no interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // IDAT (compressed scanlines)
  const compressed = deflateSync(raw);
  const idat = createChunk('IDAT', compressed);

  // IEND
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function generateSvg(size) {
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
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="${Math.max(2, size * 0.04)}" flood-color="#7c3aed" flood-opacity="0.6"/>
    </filter>
  </defs>
  <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#bg)"/>
  <circle cx="${cx}" cy="${cy}" r="${circleR}" fill="url(#circle)" filter="url(#glow)"/>
  <text x="${cx}" y="${cy}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        font-weight="800" font-size="${fontSize}" 
        fill="white" text-anchor="middle" dominant-baseline="central">AI</text>
</svg>`;
}

// Generate all sizes in both PNG and SVG formats
for (const size of SIZES) {
  const pngBuf = generatePng(size);
  writeFileSync(join(OUTPUT_DIR, `icon-${size}x${size}.png`), pngBuf);

  const svgStr = generateSvg(size);
  writeFileSync(join(OUTPUT_DIR, `icon-${size}x${size}.svg`), svgStr);

  console.log(`✓ Generated icon-${size}x${size}.png and .svg`);
}

console.log('All icons generated successfully in', OUTPUT_DIR);
