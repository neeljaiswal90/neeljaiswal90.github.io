import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../public/assets/social-card-live-v3.png', import.meta.url));
const output = fileURLToPath(new URL('../public/assets/social-card-live-v4.png', import.meta.url));

const copy = 'Ecommerce growth, 0-to-1 launches, and AI that actually ships';
const overlay = Buffer.from(`
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow" x="-20%" y="-40%" width="140%" height="180%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#281f47" flood-opacity="0.12"/>
      </filter>
    </defs>
    <rect x="270" y="544" width="660" height="86" fill="#f7f5f1"/>
    <rect x="278" y="550" width="644" height="58" rx="29" fill="#ffffff" stroke="#d9d5df" filter="url(#shadow)"/>
    <text x="600" y="585" text-anchor="middle" fill="#111114" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" letter-spacing="0.15">${copy}</text>
  </svg>
`);

await sharp(source)
  .composite([{ input: overlay, top: 0, left: 0 }])
  .png({ compressionLevel: 9 })
  .toFile(output);

const metadata = await sharp(output).metadata();
if (metadata.width !== 1200 || metadata.height !== 630) {
  throw new Error(`Unexpected social-card size: ${metadata.width}x${metadata.height}`);
}

console.log(`Created ${output} (${metadata.width}x${metadata.height})`);
