const test = require('node:test');
const assert = require('node:assert/strict');
const { sign, verifyToken, TOKEN_TTL_MS } = require('../netlify/functions/lib/tokens');

const SECRET = 'test-secret';
const DAY_MS = 24 * 60 * 60 * 1000;

test('TTL is 30 days', () => {
  assert.equal(TOKEN_TTL_MS, 30 * DAY_MS);
});

test('accepts a freshly signed token', () => {
  const ts = Date.now();
  const token = ts + '.' + sign(ts, SECRET);
  assert.equal(verifyToken(token, SECRET), true);
});

test('rejects a token signed with the wrong secret', () => {
  const ts = Date.now();
  const token = ts + '.' + sign(ts, SECRET);
  assert.equal(verifyToken(token, 'wrong-secret'), false);
});

test('accepts a token just inside the TTL window', () => {
  const ts = Date.now() - (TOKEN_TTL_MS - DAY_MS); // 1 day before expiry
  const token = ts + '.' + sign(ts, SECRET);
  assert.equal(verifyToken(token, SECRET), true);
});

test('rejects a token just past the TTL window', () => {
  const ts = Date.now() - (TOKEN_TTL_MS + DAY_MS); // 1 day past expiry
  const token = ts + '.' + sign(ts, SECRET);
  assert.equal(verifyToken(token, SECRET), false);
});

test('rejects a token timestamped in the future', () => {
  const ts = Date.now() + DAY_MS;
  const token = ts + '.' + sign(ts, SECRET);
  assert.equal(verifyToken(token, SECRET), false);
});

test('rejects malformed tokens', () => {
  assert.equal(verifyToken('', SECRET), false);
  assert.equal(verifyToken(null, SECRET), false);
  assert.equal(verifyToken(undefined, SECRET), false);
  assert.equal(verifyToken('no-dot-in-here', SECRET), false);
  assert.equal(verifyToken('not-a-number.deadbeef', SECRET), false);
  assert.equal(verifyToken(12345, SECRET), false);
});

test('rejects a tampered signature of mismatched length without throwing', () => {
  const ts = Date.now();
  const token = ts + '.' + 'zz'; // not valid hex, wrong length vs a real HMAC
  assert.doesNotThrow(() => verifyToken(token, SECRET));
  assert.equal(verifyToken(token, SECRET), false);
});

test('rejects a signature for a different, unsigned timestamp', () => {
  const ts = Date.now();
  const otherTs = ts - 1000;
  const token = ts + '.' + sign(otherTs, SECRET); // signature doesn't match ts
  assert.equal(verifyToken(token, SECRET), false);
});
