import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

const root = process.cwd();
const distDir = resolve(root, 'dist');
const configPath = resolve(root, 'vercel.json');

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}

async function inlineScriptHashes() {
  const hashes = new Set();
  const files = await htmlFiles(distDir);
  if (!files.length) throw new Error('No generated HTML found. Build the site before syncing security headers.');

  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const scripts = html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi);
    for (const match of scripts) {
      if (/\bsrc\s*=/i.test(match[1])) continue;
      const type = match[1].match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
      if (type && type !== 'module' && !type.includes('javascript') && !type.includes('ecmascript')) continue;
      const content = match[2];
      if (!content) continue;
      const digest = createHash('sha256').update(content).digest('base64');
      hashes.add(`'sha256-${digest}'`);
    }
  }

  return [...hashes].sort();
}

function securityConfig(hashes) {
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self'${hashes.length ? ` ${hashes.join(' ')}` : ''}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  return {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    redirects: [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.neeljaiswal.com' }],
        destination: 'https://neeljaiswal.com/:path*',
        permanent: true,
      },
    ],
    headers: [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
        ],
      },
    ],
  };
}

const expected = `${JSON.stringify(securityConfig(await inlineScriptHashes()), null, 2)}\n`;
const mode = process.argv[2] || '--check';

if (mode === '--write') {
  await writeFile(configPath, expected, 'utf8');
  console.log(`Security configuration synchronized from ${relative(root, distDir)}.`);
} else if (mode === '--check') {
  let actual = '';
  try {
    actual = await readFile(configPath, 'utf8');
  } catch {
    throw new Error('Missing vercel.json. Run npm run security:sync and commit the result.');
  }
  let actualConfig;
  try {
    actualConfig = JSON.parse(actual);
  } catch {
    throw new Error('vercel.json is not valid JSON. Run npm run security:sync and commit the result.');
  }
  const expectedConfig = JSON.parse(expected);
  if (JSON.stringify(actualConfig) !== JSON.stringify(expectedConfig)) {
    throw new Error('vercel.json does not match the generated pages. Run npm run security:sync and commit the result.');
  }
  console.log('Security headers and inline-script hashes match the production build.');
} else {
  throw new Error(`Unknown mode: ${mode}`);
}
