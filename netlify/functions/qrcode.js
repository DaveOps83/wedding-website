// Generates the Guest book / Gift fund QR codes server-side, so the browser
// never has to send those URLs to a third-party QR image service. Gated
// behind the same signed session token as verify.js/weather.js/content.js.

const { verifyToken } = require('./lib/tokens');
const { renderQrSvg } = require('./lib/qr');
const { CONTENT } = require('./content');

// Whitelisted, not an arbitrary ?data= param: this ties directly into
// content.js's own CONTENT object (single source of truth for the URLs)
// instead of letting any authenticated caller turn this into an open
// QR-generation proxy for arbitrary text.
const ALLOWED_KEYS = {
  guestbook: () => CONTENT.en.guestbookUrl,
  giftfund: () => CONTENT.en.giftfundUrl
};

exports.handler = async (event) => {
  const tokenSecret = process.env.WEDDING_TOKEN_SECRET;
  if (!tokenSecret) {
    console.error('WEDDING_TOKEN_SECRET environment variable not set');
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  const authHeader = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!verifyToken(token, tokenSecret)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }

  const key = event.queryStringParameters && event.queryStringParameters.key;
  const resolveUrl = ALLOWED_KEYS[key];
  if (!resolveUrl) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unknown or missing "key" query parameter' })
    };
  }

  const svg = renderQrSvg(resolveUrl());

  return {
    statusCode: 200,
    // no-store, not "private, max-age=...": a browser-cached response to this
    // exact URL could otherwise be replayed to a later request with a
    // different/missing token, bypassing the check above entirely — the
    // same class of bug found and fixed in weather.js/content.js earlier.
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' },
    body: svg
  };
};
