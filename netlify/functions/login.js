const { sign } = require('./lib/tokens');

// In-memory per-instance lockout: best-effort only. Netlify can spin up
// multiple concurrent/cold instances that don't share this Map, so a
// distributed attacker isn't fully stopped by it — the fixed per-request
// delay below is what covers that case. This adds a hard stop for the
// common case of repeated attempts landing on the same warm instance,
// with no external dependency or persistent store required.
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const attemptsByIp = new Map();

function pruneExpiredAttempts(now) {
  for (const [ip, entry] of attemptsByIp) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) attemptsByIp.delete(ip);
  }
}

function getClientIp(event) {
  return (event.headers && (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'])) || 'unknown';
}

function isRateLimited(ip, now) {
  const entry = attemptsByIp.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) return false;
  return entry.count >= RATE_LIMIT_MAX_ATTEMPTS;
}

function recordFailedAttempt(ip, now) {
  const entry = attemptsByIp.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    attemptsByIp.set(ip, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
}

function clearAttempts(ip) {
  attemptsByIp.delete(ip);
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
    const { password } = JSON.parse(event.body || '{}');

    // Read password and token-signing secret from environment variables (required, no fallback)
    const correctPassword = process.env.WEDDING_PASSWORD;
    const tokenSecret = process.env.WEDDING_TOKEN_SECRET;

    // Must have environment variables set
    if (!correctPassword || !tokenSecret) {
      console.error('WEDDING_PASSWORD or WEDDING_TOKEN_SECRET environment variable not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    const now = Date.now();
    const clientIp = getClientIp(event);
    pruneExpiredAttempts(now);

    if (isRateLimited(clientIp, now)) {
      return {
        statusCode: 429,
        headers: { 'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)) },
        body: JSON.stringify({ error: 'Too many attempts. Please try again later.' })
      };
    }

    // Validate
    if (!password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Password required' })
      };
    }

    if (password === correctPassword) {
      clearAttempts(clientIp);

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

    // Wrong password: log the attempt (never the guessed password itself), count it
    // toward this IP's lockout, and add a fixed delay before responding. This raises
    // the cost of naive brute-forcing without needing persistent storage for a full
    // rate-limit/lockout scheme.
    recordFailedAttempt(clientIp, now);
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
