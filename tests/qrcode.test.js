const test = require('node:test');
const assert = require('node:assert/strict');
const { handler } = require('../netlify/functions/qrcode');
const { sign } = require('../netlify/functions/lib/tokens');
const { renderQrSvg } = require('../netlify/functions/lib/qr');
const { CONTENT } = require('../netlify/functions/content');

const SECRET = 'test-secret';

function withEnv(fn) {
  const prev = process.env.WEDDING_TOKEN_SECRET;
  process.env.WEDDING_TOKEN_SECRET = SECRET;
  return fn().finally(() => { process.env.WEDDING_TOKEN_SECRET = prev; });
}

function validToken() {
  const ts = Date.now();
  return ts + '.' + sign(ts, SECRET);
}

function bearer(token, key) {
  return { headers: { authorization: 'Bearer ' + token }, queryStringParameters: key ? { key } : {} };
}

test('rejects requests with no Authorization header', () => withEnv(async () => {
  const res = await handler({ headers: {}, queryStringParameters: { key: 'guestbook' } });
  assert.equal(res.statusCode, 401);
}));

test('rejects a forged/garbage token', () => withEnv(async () => {
  const res = await handler(bearer('garbage.token', 'guestbook'));
  assert.equal(res.statusCode, 401);
}));

test('fails closed when WEDDING_TOKEN_SECRET is not configured', async () => {
  const prev = process.env.WEDDING_TOKEN_SECRET;
  delete process.env.WEDDING_TOKEN_SECRET;
  try {
    const res = await handler(bearer('anything', 'guestbook'));
    assert.equal(res.statusCode, 500);
  } finally {
    process.env.WEDDING_TOKEN_SECRET = prev;
  }
});

test('rejects a missing or unknown "key"', () => withEnv(async () => {
  const missing = await handler(bearer(validToken()));
  assert.equal(missing.statusCode, 400);

  const unknown = await handler(bearer(validToken(), 'literally-anything-else'));
  assert.equal(unknown.statusCode, 400);
}));

test('does not accept an arbitrary ?key= as free-text data (no open QR-proxy)', () => withEnv(async () => {
  // "guestbook" and "giftfund" are the only valid keys — this isn't a
  // ?data=<anything> proxy for an authenticated caller to abuse.
  const res = await handler(bearer(validToken(), 'https://evil.example/phish'));
  assert.equal(res.statusCode, 400);
}));

for (const key of ['guestbook', 'giftfund']) {
  test(`serves a correct, never-cached SVG for key=${key}`, () => withEnv(async () => {
    const res = await handler(bearer(validToken(), key));
    assert.equal(res.statusCode, 200);
    assert.equal(res.headers['Content-Type'], 'image/svg+xml');
    assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.match(res.body, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);

    // Correctness: regenerate independently (same library, same options) for
    // the known URL and expect a byte-for-byte identical SVG, rather than
    // pulling in a QR-decoding library just to verify round-trip encoding.
    const expectedUrl = key === 'guestbook' ? CONTENT.en.guestbookUrl : CONTENT.en.giftfundUrl;
    const expectedSvg = renderQrSvg(expectedUrl);
    assert.equal(res.body, expectedSvg);
  }));
}

test('encodes different content for guestbook vs giftfund (sanity check they are not swapped)', () => withEnv(async () => {
  const guestbook = await handler(bearer(validToken(), 'guestbook'));
  const giftfund = await handler(bearer(validToken(), 'giftfund'));
  assert.notEqual(guestbook.body, giftfund.body);
}));
