const { sign } = require('./lib/tokens');

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { password } = JSON.parse(event.body || '{}');

    // Read password and token-signing secret from environment variables (required, no fallback)
    const correctPassword = process.env.WEDDING_PASSWORD;
    const tokenSecret = process.env.WEDDING_TOKEN_SECRET;

    // Validate
    if (!password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Password required' })
      };
    }

    // Must have environment variables set
    if (!correctPassword || !tokenSecret) {
      console.error('WEDDING_PASSWORD or WEDDING_TOKEN_SECRET environment variable not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    if (password === correctPassword) {
      // Issue a signed, time-bound token instead of a static string.
      // Format: "<timestamp>.<hmac-sha256(timestamp, secret)>"
      // verify.js recomputes the HMAC and checks expiry before trusting it.
      const timestamp = Date.now();
      const signature = sign(timestamp, tokenSecret);
      const token = `${timestamp}.${signature}`;

      return {
        statusCode: 200,
        body: JSON.stringify({ token })
      };
    }

    // Wrong password: log the attempt (never the guessed password itself) and add a
    // fixed delay before responding. This raises the cost of naive brute-forcing
    // without needing persistent storage for a full rate-limit/lockout scheme.
    const clientIp = (event.headers && (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'])) || 'unknown';
    console.warn(`Failed login attempt from ${clientIp} at ${new Date().toISOString()}`);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid password' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
