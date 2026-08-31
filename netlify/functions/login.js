exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { password } = JSON.parse(event.body);

    // Read password from environment variable (required, no fallback)
    const correctPassword = process.env.WEDDING_PASSWORD;

    // Validate
    if (!password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Password required' })
      };
    }

    // Must have environment variable set
    if (!correctPassword) {
      console.error('WEDDING_PASSWORD environment variable not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    if (password === correctPassword) {
      return {
        statusCode: 200,
        body: JSON.stringify({ token: 'valid', authenticated: true })
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid password' })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
