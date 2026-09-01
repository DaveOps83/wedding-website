// Regression guard: img-src used to include a bare "https:" wildcard, added
// specifically to allow the (now-removed) third-party qrserver.com QR image
// service. QR codes are generated server-side now (see qrcode.js), so that
// wildcard should stay gone — this test fails if it quietly comes back.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const netlifyToml = fs.readFileSync(path.join(__dirname, '..', 'netlify.toml'), 'utf8');
const cspLine = netlifyToml.split('\n').find((l) => l.includes('Content-Security-Policy'));

test('a Content-Security-Policy header is configured', () => {
  assert.ok(cspLine, 'expected a Content-Security-Policy line in netlify.toml');
});

test('img-src does not carry a bare https: wildcard', () => {
  const imgSrc = cspLine.match(/img-src ([^;]+);/);
  assert.ok(imgSrc, 'expected an img-src directive');
  assert.doesNotMatch(imgSrc[1], /(^|\s)https:(\s|$)/, `img-src should not allow arbitrary https: origins — got: "${imgSrc[1]}"`);
  assert.match(imgSrc[1], /'self'/);
});

test('img-src allows blob: — the QR code <img> tags load from blob: object URLs (see fetchQrImage in index.html)', () => {
  // Regression: this was missing entirely for one deploy, silently blocking
  // both QR code images with no visible error in local testing (python's
  // http.server sends no CSP header at all, so the block only showed up on
  // the real deployed site).
  const imgSrc = cspLine.match(/img-src ([^;]+);/);
  assert.ok(imgSrc, 'expected an img-src directive');
  assert.match(imgSrc[1], /(^|\s)blob:(\s|$)/, `img-src must allow blob: for the QR code images — got: "${imgSrc[1]}"`);
});

test('frame-src stays scoped to Google Maps only', () => {
  const frameSrc = cspLine.match(/frame-src ([^;]+);/);
  assert.ok(frameSrc, 'expected a frame-src directive');
  assert.equal(frameSrc[1].trim(), 'https://www.google.com');
});
