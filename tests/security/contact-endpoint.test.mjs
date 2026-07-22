import assert from 'node:assert/strict';
import test from 'node:test';
import { handleContact, resetContactRateLimitForTests } from '../../api/contact.js';

function request(overrides = {}) {
  const headers = {
    accept: 'application/json',
    host: 'neeljaiswal.com',
    origin: 'https://neeljaiswal.com',
    'x-forwarded-for': '203.0.113.10',
    ...overrides.headers,
  };
  const body = {
    name: 'Portfolio Visitor',
    email: 'visitor@example.com',
    company: 'Example Co',
    message: 'I would like to discuss a product leadership opportunity.',
    ...overrides.body,
  };
  return {
    method: 'POST',
    url: '/api/contact',
    ...overrides,
    headers,
    body,
  };
}

function response() {
  return {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    end(value = '') { this.body = value; },
  };
}

test.beforeEach(() => resetContactRateLimitForTests());

test('rejects non-POST methods and advertises the allowed method', async () => {
  const req = request({ method: 'GET', body: undefined });
  const res = response();
  await handleContact(req, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, 'POST');
  assert.equal(JSON.parse(res.body).ok, false);
});

test('rejects cross-origin browser submissions before relaying', async () => {
  const res = response();
  let relayed = false;
  await handleContact(request({ headers: { origin: 'https://attacker.example' } }), res, {
    fetchImpl: async () => { relayed = true; },
  });
  assert.equal(res.statusCode, 403);
  assert.equal(relayed, false);
});

test('validates fields and never sends invalid payloads', async () => {
  const res = response();
  let relayed = false;
  await handleContact(request({ body: { email: 'not-an-email', message: 'too short' } }), res, {
    fetchImpl: async () => { relayed = true; },
  });
  assert.equal(res.statusCode, 400);
  assert.deepEqual(JSON.parse(res.body).fields, ['email', 'message']);
  assert.equal(relayed, false);
});

test('quietly accepts honeypot submissions without contacting the relay', async () => {
  const res = response();
  let relayed = false;
  await handleContact(request({ body: { _honey: 'spam' } }), res, {
    fetchImpl: async () => { relayed = true; },
  });
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).ok, true);
  assert.equal(relayed, false);
});

test('relays a normalized, validated message server-side', async () => {
  const res = response();
  let relayRequest;
  await handleContact(request(), res, {
    contactEmail: 'owner@example.com',
    fetchImpl: async (url, init) => {
      relayRequest = { url, init };
      return { ok: true, status: 200 };
    },
  });
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).ok, true);
  assert.equal(relayRequest.url, 'https://formsubmit.co/ajax/owner%40example.com');
  assert.equal(relayRequest.init.headers['Content-Type'], 'application/x-www-form-urlencoded;charset=UTF-8');
  const relayBody = new URLSearchParams(relayRequest.init.body);
  assert.equal(relayBody.get('email'), 'visitor@example.com');
  assert.equal(relayBody.get('_captcha'), 'false');
});

test('rate limits repeated submissions from the same address', async () => {
  const fetchImpl = async () => ({ ok: true, status: 200 });
  for (let index = 0; index < 5; index += 1) {
    const res = response();
    await handleContact(request(), res, { fetchImpl, now: 1_000 });
    assert.equal(res.statusCode, 200);
  }
  const limited = response();
  await handleContact(request(), limited, { fetchImpl, now: 1_000 });
  assert.equal(limited.statusCode, 429);
  assert.equal(limited.headers['retry-after'], '900');
});
