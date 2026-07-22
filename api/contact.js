import {
  CONTACT_LIMITS,
  DEFAULT_CONTACT_EMAIL,
  buildRelayBody,
  contactRelayUrl,
  isAllowedContactOrigin,
  normalizeContactPayload,
  validateContactPayload,
} from '../src/server/contact-core.mjs';

const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 5;
const rateBuckets = new Map();

function requestHeader(req, name) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function requestIp(req) {
  const forwarded = requestHeader(req, 'x-forwarded-for');
  return (forwarded?.split(',')[0] || req.socket?.remoteAddress || 'unknown').trim();
}

function wantsJson(req) {
  return (requestHeader(req, 'accept') || '').includes('application/json');
}

function setCommonHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function redirect(res, location) {
  res.statusCode = 303;
  res.setHeader('Location', location);
  res.end('See Other');
}

async function readPayload(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    const contentType = requestHeader(req, 'content-type') || '';
    if (contentType.includes('application/json')) return JSON.parse(req.body);
    return Object.fromEntries(new URLSearchParams(req.body));
  }

  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (Buffer.byteLength(raw) > CONTACT_LIMITS.payloadBytes) throw new RangeError('Payload too large');
  }
  const contentType = requestHeader(req, 'content-type') || '';
  if (contentType.includes('application/json')) return raw ? JSON.parse(raw) : {};
  return Object.fromEntries(new URLSearchParams(raw));
}

function isRateLimited(ip, now) {
  const recent = (rateBuckets.get(ip) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    rateBuckets.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(ip, recent);
  return false;
}

export function resetContactRateLimitForTests() {
  rateBuckets.clear();
}

export async function handleContact(req, res, options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const now = options.now ?? Date.now();
  const contactEmail = options.contactEmail || process.env.CONTACT_EMAIL || DEFAULT_CONTACT_EMAIL;
  setCommonHeaders(res);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  const contentLength = Number(requestHeader(req, 'content-length') || 0);
  if (contentLength > CONTACT_LIMITS.payloadBytes) {
    return sendJson(res, 413, { ok: false, error: 'Request is too large.' });
  }

  const requestUrl = `https://${requestHeader(req, 'host') || 'neeljaiswal.com'}${req.url || '/api/contact'}`;
  if (!isAllowedContactOrigin(requestHeader(req, 'origin'), requestUrl)) {
    return sendJson(res, 403, { ok: false, error: 'Request origin is not allowed.' });
  }

  let payload;
  try {
    payload = normalizeContactPayload(await readPayload(req));
  } catch (error) {
    const status = error instanceof RangeError ? 413 : 400;
    return sendJson(res, status, { ok: false, error: status === 413 ? 'Request is too large.' : 'Invalid request.' });
  }

  // Quietly accept honeypot submissions so automated senders receive no useful signal.
  if (payload.honey) {
    return wantsJson(req) ? sendJson(res, 200, { ok: true }) : redirect(res, '/?contact=sent#contact');
  }

  const invalidFields = validateContactPayload(payload);
  if (invalidFields.length) {
    if (!wantsJson(req)) return redirect(res, '/?contact=error#contact');
    return sendJson(res, 400, { ok: false, error: 'Please check the form and try again.', fields: invalidFields });
  }

  if (isRateLimited(requestIp(req), now)) {
    res.setHeader('Retry-After', String(Math.ceil(RATE_WINDOW_MS / 1000)));
    return sendJson(res, 429, { ok: false, error: 'Too many messages. Please try again later.' });
  }

  try {
    const relayResponse = await fetchImpl(contactRelayUrl(contactEmail), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: buildRelayBody(payload).toString(),
      redirect: 'follow',
    });
    if (!relayResponse.ok) throw new Error(`Relay failed with ${relayResponse.status}`);
  } catch {
    return sendJson(res, 502, { ok: false, error: 'Message delivery is temporarily unavailable.' });
  }

  return wantsJson(req) ? sendJson(res, 200, { ok: true }) : redirect(res, '/?contact=sent#contact');
}

export default async function contactHandler(req, res) {
  return handleContact(req, res);
}
