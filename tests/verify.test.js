const test = require('node:test');
const assert = require('node:assert/strict');
const { handler } = require('../netlify/functions/verify');
const { sign } = require('../netlify/functions/lib/tokens');

const SECRET = 'test-secret';

function withEnv(fn) {
  const prev = process.env.WEDDING_TOKEN_SECRET;
  process.env.WEDDING_TOKEN_SECRET = SECRET;
  return fn().finally(() => { process.env.WEDDING_TOKEN_SECRET = prev; });
}

test('rejects non-POST requests', () => withEnv(async () => {
  const res = await handler({ httpMethod: 'GET' });
  assert.equal(res.statusCode, 405);
}));

test('accepts a valid token', () => withEnv(async () => {
  const ts = Date.now();
  const token = ts + '.' + sign(ts, SECRET);
  const res = await handler({ httpMethod: 'POST', body: JSON.stringify({ token }) });
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).valid, true);
}));

test('rejects a forged token (wrong secret)', () => withEnv(async () => {
  const ts = Date.now();
  const token = ts + '.' + sign(ts, 'someone-elses-secret');
  const res = await handler({ httpMethod: 'POST', body: JSON.stringify({ token }) });
  assert.equal(res.statusCode, 401);
}));

test('rejects a missing token', () => withEnv(async () => {
  const res = await handler({ httpMethod: 'POST', body: JSON.stringify({}) });
  assert.equal(res.statusCode, 401);
}));

test('rejects malformed request bodies without throwing', () => withEnv(async () => {
  const res = await handler({ httpMethod: 'POST', body: '{not json' });
  assert.equal(res.statusCode, 401);
}));

test('fails closed when WEDDING_TOKEN_SECRET is not configured', async () => {
  const prev = process.env.WEDDING_TOKEN_SECRET;
  delete process.env.WEDDING_TOKEN_SECRET;
  try {
    const res = await handler({ httpMethod: 'POST', body: JSON.stringify({ token: 'anything' }) });
    assert.equal(res.statusCode, 500);
  } finally {
    process.env.WEDDING_TOKEN_SECRET = prev;
  }
});
