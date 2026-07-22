import { access, copyFile, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const projectRoot = process.cwd();
const distDir = resolve(projectRoot, 'dist');
const clientDir = join(distDir, 'client');
const serverDir = join(distDir, 'server');
const rootDocument = join(distDir, 'index.html');
const vercelConfig = JSON.parse(await readFile(resolve(projectRoot, 'vercel.json'), 'utf8'));
const securityHeaders = vercelConfig.headers?.[0]?.headers ?? [];

try {
  await access(rootDocument);
} catch {
  throw new Error('Missing dist/index.html. Run the Astro production build before staging Sites output.');
}

await rm(clientDir, { recursive: true, force: true });
await rm(serverDir, { recursive: true, force: true });
await mkdir(clientDir, { recursive: true });

for (const entry of await readdir(distDir, { withFileTypes: true })) {
  if (entry.name === 'client' || entry.name === 'server' || entry.name === '.openai') continue;
  await rename(join(distDir, entry.name), join(clientDir, entry.name));
}

await mkdir(serverDir, { recursive: true });
await copyFile(resolve(projectRoot, 'src/server/contact-core.mjs'), join(serverDir, 'contact-core.mjs'));
await writeFile(join(serverDir, 'index.js'), `import {
  CONTACT_LIMITS,
  DEFAULT_CONTACT_EMAIL,
  buildRelayBody,
  contactRelayUrl,
  isAllowedContactOrigin,
  normalizeContactPayload,
  validateContactPayload,
} from './contact-core.mjs';

const securityHeaders = ${JSON.stringify(securityHeaders)};
const rateBuckets = new Map();
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;

function response(body, init = {}) {
  const headers = new Headers(init.headers);
  for (const { key, value } of securityHeaders) headers.set(key, value);
  headers.set('Cache-Control', 'no-store, max-age=0');
  return new Response(body, { ...init, headers });
}

function json(status, body, extraHeaders) {
  return response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (rateBuckets.get(ip) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  rateBuckets.set(ip, recent);
  return false;
}

async function contact(request, env) {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed.' }, { Allow: 'POST' });
  if (Number(request.headers.get('content-length') || 0) > CONTACT_LIMITS.payloadBytes) {
    return json(413, { ok: false, error: 'Request is too large.' });
  }
  if (!isAllowedContactOrigin(request.headers.get('origin'), request.url)) {
    return json(403, { ok: false, error: 'Request origin is not allowed.' });
  }

  let raw;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > CONTACT_LIMITS.payloadBytes) throw new RangeError();
    raw = (request.headers.get('content-type') || '').includes('application/json')
      ? JSON.parse(text || '{}')
      : Object.fromEntries(new URLSearchParams(text));
  } catch (error) {
    return json(error instanceof RangeError ? 413 : 400, { ok: false, error: 'Invalid request.' });
  }

  const payload = normalizeContactPayload(raw);
  if (payload.honey) return json(200, { ok: true });
  const fields = validateContactPayload(payload);
  if (fields.length) return json(400, { ok: false, error: 'Please check the form and try again.', fields });
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (rateLimited(ip)) {
    return json(429, { ok: false, error: 'Too many messages. Please try again later.' }, { 'Retry-After': String(RATE_WINDOW_MS / 1000) });
  }

  const relay = await fetch(contactRelayUrl(env.CONTACT_EMAIL || DEFAULT_CONTACT_EMAIL), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: buildRelayBody(payload).toString(),
    redirect: 'follow',
  }).catch(() => null);
  if (!relay?.ok) return json(502, { ok: false, error: 'Message delivery is temporarily unavailable.' });
  return json(200, { ok: true });
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') return contact(request, env);
    if (!env?.ASSETS || typeof env.ASSETS.fetch !== 'function') {
      return response('Static asset binding unavailable.', { status: 500 });
    }
    const asset = await env.ASSETS.fetch(request);
    const headers = new Headers(asset.headers);
    for (const { key, value } of securityHeaders) headers.set(key, value);
    return new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers });
  },
};

export default worker;
`, 'utf8');

await access(join(clientDir, 'index.html'));
await access(join(serverDir, 'index.js'));
await access(join(serverDir, 'contact-core.mjs'));
console.log('Sites output staged: hardened static assets + first-party contact Worker.');
