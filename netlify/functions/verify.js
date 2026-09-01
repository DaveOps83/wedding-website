const { verifyToken } = require('./lib/tokens');

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

    if (!verifyToken(token, tokenSecret)) {
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
