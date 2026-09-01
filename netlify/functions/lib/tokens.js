const crypto = require('crypto');

// Tokens are valid for two weeks after issuance — long enough that a guest who
// logs in once before the wedding stays signed in through the whole trip,
// short enough that a leaked token doesn't grant indefinite access.
const TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function sign(timestamp, secret) {
  return crypto.createHmac('sha256', secret).update(String(timestamp)).digest('hex');
}

// Verifies a "<timestamp>.<hmac-sha256(timestamp, secret)>" token: checks shape,
// expiry, and recomputes the HMAC with a constant-time comparison so signature
// bytes can't leak via timing.
function verifyToken(token, secret) {
  if (!token || typeof token !== 'string' || token.indexOf('.') === -1) return false;

  const separatorIndex = token.indexOf('.');
  const timestampStr = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const timestamp = Number(timestampStr);

  if (!timestamp || !signature) return false;
  if (Date.now() - timestamp > TOKEN_TTL_MS || timestamp > Date.now()) return false;

  const expected = sign(timestamp, secret);
  let expectedBuf, givenBuf;
  try {
    expectedBuf = Buffer.from(expected, 'hex');
    givenBuf = Buffer.from(signature, 'hex');
  } catch {
    return false;
  }

  return expectedBuf.length === givenBuf.length && crypto.timingSafeEqual(expectedBuf, givenBuf);
}

module.exports = { sign, verifyToken, TOKEN_TTL_MS };
