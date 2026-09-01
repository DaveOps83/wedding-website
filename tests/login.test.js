const test = require('node:test');
const assert = require('node:assert/strict');
const { verifyToken } = require('../netlify/functions/lib/tokens');

const ENV = { WEDDING_PASSWORD: 'correct-horse', WEDDING_TOKEN_SECRET: 'test-secret' };
const LOGIN_PATH = require.resolve('../netlify/functions/login');

// login.js now keeps an in-memory per-IP attempt counter for rate limiting —
// exactly the kind of module-level state that needs a fresh instance per
// test so one test's failed attempts don't lock out another (mirrors the
// freshHandler() pattern in weather.test.js).
function freshHandler() {
  delete require.cache[LOGIN_PATH];
  return require('../netlify/functions/login').handler;
}

function withEnv(fn) {
  const prev = { WEDDING_PASSWORD: process.env.WEDDING_PASSWORD, WEDDING_TOKEN_SECRET: process.env.WEDDING_TOKEN_SECRET };
  Object.assign(process.env, ENV);
  return fn().finally(() => Object.assign(process.env, prev));
}

function fromIp(ip) { return { headers: { 'x-nf-client-connection-ip': ip } }; }

test('rejects non-POST requests', () => withEnv(async () => {
  const res = await freshHandler()({ httpMethod: 'GET' });
  assert.equal(res.statusCode, 405);
}));

test('rejects an incorrect password without leaking whether it was close', () => withEnv(async () => {
  const res = await freshHandler()({ httpMethod: 'POST', body: JSON.stringify({ password: 'wrong' }), ...fromIp('10.0.0.1') });
  const body = JSON.parse(res.body);
  assert.equal(res.statusCode, 401);
  assert.equal(body.token, undefined);
}));

test('rejects a missing/empty password', () => withEnv(async () => {
  const res = await freshHandler()({ httpMethod: 'POST', body: JSON.stringify({}), ...fromIp('10.0.0.2') });
  assert.equal(res.statusCode, 400);
}));

test('issues a verifiable token for the correct password', () => withEnv(async () => {
  const res = await freshHandler()({ httpMethod: 'POST', body: JSON.stringify({ password: 'correct-horse' }), ...fromIp('10.0.0.3') });
  const body = JSON.parse(res.body);
  assert.equal(res.statusCode, 200);
  assert.equal(typeof body.token, 'string');
  assert.equal(verifyToken(body.token, 'test-secret'), true);
}));

test('fails closed (500, no token) when WEDDING_TOKEN_SECRET is not configured', async () => {
  const prev = { WEDDING_PASSWORD: process.env.WEDDING_PASSWORD, WEDDING_TOKEN_SECRET: process.env.WEDDING_TOKEN_SECRET };
  process.env.WEDDING_PASSWORD = 'correct-horse';
  delete process.env.WEDDING_TOKEN_SECRET;
  try {
    const res = await freshHandler()({ httpMethod: 'POST', body: JSON.stringify({ password: 'correct-horse' }), ...fromIp('10.0.0.4') });
    assert.equal(res.statusCode, 500);
    assert.equal(JSON.parse(res.body).token, undefined);
  } finally {
    Object.assign(process.env, prev);
  }
});

test('rate-limits after too many failed attempts from the same IP, short-circuiting fast with Retry-After', () => withEnv(async () => {
  const handler = freshHandler();
  const attempt = () => handler({ httpMethod: 'POST', body: JSON.stringify({ password: 'wrong' }), ...fromIp('203.0.113.5') });

  // Exhaust the allowed attempts — each is a genuine wrong-password check, so
  // each takes ~1.2s (the intentional brute-force delay).
  for (let i = 0; i < 5; i++) {
    const res = await attempt();
    assert.equal(res.statusCode, 401, `attempt ${i + 1} should still be a normal rejection`);
  }

  // The next attempt from the same IP should be locked out immediately —
  // no password check, no 1.2s delay.
  const start = Date.now();
  const locked = await attempt();
  const elapsed = Date.now() - start;
  assert.equal(locked.statusCode, 429);
  assert.ok(elapsed < 300, `expected the lockout to short-circuit fast, took ${elapsed}ms`);
  assert.ok(locked.headers && locked.headers['Retry-After'], 'expected a Retry-After header on the 429');

  // Even the CORRECT password is locked out for this IP until the window clears —
  // otherwise the lockout would be trivially bypassable by just... entering the
  // right password, which defeats the point of rate-limiting guesses.
  const correctWhileLocked = await handler({ httpMethod: 'POST', body: JSON.stringify({ password: 'correct-horse' }), ...fromIp('203.0.113.5') });
  assert.equal(correctWhileLocked.statusCode, 429);
}));

test('rate limiting is scoped per IP — a different IP is unaffected', () => withEnv(async () => {
  const handler = freshHandler();
  for (let i = 0; i < 5; i++) {
    await handler({ httpMethod: 'POST', body: JSON.stringify({ password: 'wrong' }), ...fromIp('203.0.113.6') });
  }
  const otherIp = await handler({ httpMethod: 'POST', body: JSON.stringify({ password: 'wrong' }), ...fromIp('198.51.100.9') });
  assert.equal(otherIp.statusCode, 401); // not 429 — separate bucket
}));

test('a successful login clears the failed-attempt count for that IP', () => withEnv(async () => {
  const handler = freshHandler();
  const ip = fromIp('203.0.113.7');

  for (let i = 0; i < 4; i++) {
    const res = await handler({ httpMethod: 'POST', body: JSON.stringify({ password: 'wrong' }), ...ip });
    assert.equal(res.statusCode, 401);
  }

  const success = await handler({ httpMethod: 'POST', body: JSON.stringify({ password: 'correct-horse' }), ...ip });
  assert.equal(success.statusCode, 200);

  // The counter should have been reset by the success, not carried over.
  const afterReset = await handler({ httpMethod: 'POST', body: JSON.stringify({ password: 'wrong' }), ...ip });
  assert.equal(afterReset.statusCode, 401); // not 429
}));
