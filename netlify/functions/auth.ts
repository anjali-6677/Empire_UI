import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'flutebyte@example.com';
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  '$2a$10$DzwpHLhmqe9pCTbZtSbrz.tnFSljDZwXzMEuWyXsU8AWJbgcNKaJS';
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

  const path = event.path || '';

  // Route: /api/auth/login or /login
  if (path.endsWith('/login')) {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: responseHeaders,
        body: JSON.stringify({ success: false, message: 'Method Not Allowed' }),
      };
    }

    try {
      const body = event.body ? JSON.parse(event.body) : {};
      const { email, password } = body;

      if (!email || !password) {
        return {
          statusCode: 401,
          headers: responseHeaders,
          body: JSON.stringify({ success: false, message: 'Invalid email or password' }),
        };
      }

      const emailMatches = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const passwordMatches = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);

      if (!emailMatches || !passwordMatches) {
        return {
          statusCode: 401,
          headers: responseHeaders,
          body: JSON.stringify({ success: false, message: 'Invalid email or password' }),
        };
      }

      const user = {
        email: ADMIN_EMAIL,
        name: 'Flutebyte Admin',
        role: 'admin',
      };

      const token = jwt.sign(user, JWT_SECRET, { expiresIn: '8h' });

      return {
        statusCode: 200,
        headers: responseHeaders,
        body: JSON.stringify({ success: true, user, token }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        headers: responseHeaders,
        body: JSON.stringify({ success: false, message: 'Authentication service error' }),
      };
    }
  }

  // Route: /api/auth/me or /me
  if (path.endsWith('/me')) {
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
  }

  // Route: /api/auth/logout or /logout
  if (path.endsWith('/logout')) {
    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({ success: true, message: 'Logged out successfully' }),
    };
  }

  return {
    statusCode: 404,
    headers: responseHeaders,
    body: JSON.stringify({ success: false, message: 'Auth Endpoint Not Found' }),
  };
};
