const test = require('node:test');
const assert = require('node:assert/strict');
const { handler } = require('../netlify/functions/login');
const { verifyToken } = require('../netlify/functions/lib/tokens');

const ENV = { WEDDING_PASSWORD: 'correct-horse', WEDDING_TOKEN_SECRET: 'test-secret' };

function withEnv(fn) {
  const prev = { WEDDING_PASSWORD: process.env.WEDDING_PASSWORD, WEDDING_TOKEN_SECRET: process.env.WEDDING_TOKEN_SECRET };
  Object.assign(process.env, ENV);
  return fn().finally(() => Object.assign(process.env, prev));
}

test('rejects non-POST requests', () => withEnv(async () => {
  const res = await handler({ httpMethod: 'GET' });
  assert.equal(res.statusCode, 405);
}));

test('rejects an incorrect password without leaking whether it was close', () => withEnv(async () => {
  const res = await handler({ httpMethod: 'POST', body: JSON.stringify({ password: 'wrong' }), headers: {} });
  const body = JSON.parse(res.body);
  assert.equal(res.statusCode, 401);
  assert.equal(body.token, undefined);
}));

test('rejects a missing/empty password', () => withEnv(async () => {
  const res = await handler({ httpMethod: 'POST', body: JSON.stringify({}), headers: {} });
  assert.equal(res.statusCode, 400);
}));

test('issues a verifiable token for the correct password', () => withEnv(async () => {
  const res = await handler({ httpMethod: 'POST', body: JSON.stringify({ password: 'correct-horse' }), headers: {} });
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
    const res = await handler({ httpMethod: 'POST', body: JSON.stringify({ password: 'correct-horse' }), headers: {} });
    assert.equal(res.statusCode, 500);
    assert.equal(JSON.parse(res.body).token, undefined);
  } finally {
    Object.assign(process.env, prev);
  }
});
