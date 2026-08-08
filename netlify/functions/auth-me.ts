import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'flutebyte_empire_erp_secret_key_2026_x89a_prod_secure';

const responseHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: responseHeaders, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: responseHeaders,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' }),
    };
  }

  try {
    const authHeader = event.headers.authorization || event.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers: responseHeaders,
        body: JSON.stringify({ success: false, message: 'Missing or invalid token' }),
      };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({
        success: true,
        user: {
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      headers: responseHeaders,
      body: JSON.stringify({ success: false, message: 'Invalid or expired token' }),
    };
  }
};
