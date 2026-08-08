import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'flutebyte@example.com',
  ADMIN_PASSWORD_HASH:
    process.env.ADMIN_PASSWORD_HASH ||
    '$2a$10$DzwpHLhmqe9pCTbZtSbrz.tnFSljDZwXzMEuWyXsU8AWJbgcNKaJS',
  JWT_SECRET: process.env.JWT_SECRET || 'flutebyte_empire_erp_secret_key_2026_x89a_prod_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
};
