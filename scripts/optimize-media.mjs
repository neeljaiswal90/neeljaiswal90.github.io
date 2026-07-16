import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Full-resolution owner-supplied originals stay outside public Git history.
// Place them in the ignored source-assets directory before regenerating.
const sourceDirectory = path.join(repoRoot, 'source-assets');
const outputDirectory = path.join(repoRoot, 'public', 'assets');

const jobs = [
  { source: 'headshot.jpg', stem: 'headshot', widths: [160, 320, 640, 870] },
  { source: 'weightlifting-podium-real.jpeg', stem: 'weightlifting-podium-real', widths: [480, 768, 1134] },
  { source: 'wcg-archive-real.jpg', stem: 'wcg-archive-real', widths: [320, 500] },
  { source: 'weightlifting-medal-tshirt-edited.webp', stem: 'weightlifting-medal-tshirt-edited', widths: [480, 768, 1122] },
  { source: 'weightlifting-silver-podium-real.webp', stem: 'weightlifting-silver-podium-real', widths: [480, 768, 1200] },
];

for (const job of jobs) {
  const input = path.join(sourceDirectory, job.source);
  for (const width of job.widths) {
    const image = sharp(input).rotate().resize({ width, withoutEnlargement: true });
    await Promise.all([
      image.clone().webp({ quality: 82, effort: 5, smartSubsample: true })
        .toFile(path.join(outputDirectory, `${job.stem}-${width}.webp`)),
      image.clone().avif({ quality: 55, effort: 5, chromaSubsampling: '4:2:0' })
        .toFile(path.join(outputDirectory, `${job.stem}-${width}.avif`)),
    ]);
  }
}

console.log(`Generated responsive AVIF and WebP variants for ${jobs.length} real photographs.`);
