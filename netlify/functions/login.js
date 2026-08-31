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

    // Read password from environment variable
    const correctPassword = process.env.WEDDING_PASSWORD || 'welcome2026';

    // Validate
    if (!password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Password required' })
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
