const crypto = require('crypto');

// Tokens are valid for 48 hours after issuance — long enough to cover the whole
// wedding weekend from a single login, short enough that a leaked token doesn't
// grant indefinite access.
const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

function sign(timestamp, secret) {
  return crypto.createHmac('sha256', secret).update(String(timestamp)).digest('hex');
}

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { token } = JSON.parse(event.body || '{}');
    const tokenSecret = process.env.WEDDING_TOKEN_SECRET;

    if (!tokenSecret) {
      console.error('WEDDING_TOKEN_SECRET environment variable not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    if (!token || typeof token !== 'string' || token.indexOf('.') === -1) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    const separatorIndex = token.indexOf('.');
    const timestampStr = token.slice(0, separatorIndex);
    const signature = token.slice(separatorIndex + 1);
    const timestamp = Number(timestampStr);

    if (!timestamp || !signature) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    if (Date.now() - timestamp > TOKEN_TTL_MS || timestamp > Date.now()) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Token expired' })
      };
    }

    const expected = sign(timestamp, tokenSecret);
    const expectedBuf = Buffer.from(expected, 'hex');
    const givenBuf = Buffer.from(signature, 'hex');

    // Constant-time comparison to avoid leaking signature bytes via timing.
    const isValid = expectedBuf.length === givenBuf.length && crypto.timingSafeEqual(expectedBuf, givenBuf);

    if (!isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true })
    };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid token' })
    };
  }
};
