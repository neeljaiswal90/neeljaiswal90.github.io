export const DEFAULT_CONTACT_EMAIL = 'neeljaiswal90@gmail.com';

export const CONTACT_LIMITS = Object.freeze({
  name: 120,
  email: 254,
  company: 160,
  message: 5000,
  minimumMessage: 20,
  payloadBytes: 16_384,
});

const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;

function text(value) {
  return typeof value === 'string' ? value.replaceAll('\0', '').trim() : '';
}

export function normalizeContactPayload(payload = {}) {
  return {
    name: text(payload.name),
    email: text(payload.email).toLowerCase(),
    company: text(payload.company),
    message: text(payload.message),
    honey: text(payload._honey),
  };
}

export function validateContactPayload(payload) {
  const fields = [];
  if (payload.name.length < 2 || payload.name.length > CONTACT_LIMITS.name) fields.push('name');
  if (payload.email.length > CONTACT_LIMITS.email || !emailPattern.test(payload.email)) fields.push('email');
  if (payload.company.length > CONTACT_LIMITS.company) fields.push('company');
  if (payload.message.length < CONTACT_LIMITS.minimumMessage || payload.message.length > CONTACT_LIMITS.message) {
    fields.push('message');
  }
  return fields;
}

export function isAllowedContactOrigin(origin, requestUrl) {
  if (!origin) return true;
  try {
    const requestOrigin = new URL(requestUrl).origin;
    return origin === requestOrigin
      || origin === 'https://neeljaiswal.com'
      || origin === 'https://www.neeljaiswal.com';
  } catch {
    return false;
  }
}

export function buildRelayBody(payload) {
  return new URLSearchParams({
    name: payload.name,
    email: payload.email,
    company: payload.company,
    message: payload.message,
    _subject: 'New portfolio inquiry from neeljaiswal.com',
    _template: 'table',
    _captcha: 'false',
  });
}

export function contactRelayUrl(email = DEFAULT_CONTACT_EMAIL) {
  return `https://formsubmit.co/ajax/${encodeURIComponent(email)}`;
}
