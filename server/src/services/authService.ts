import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface UserPayload {
  email: string;
  name: string;
  role: string;
}

export class AuthService {
  private static adminUser: UserPayload = {
    email: env.ADMIN_EMAIL,
    name: 'Flutebyte Admin',
    role: 'admin',
  };

  public static async validateCredentials(
    email: string,
    password: string
  ): Promise<UserPayload | null> {
    if (!email || !password) return null;

    // Email check (case-insensitive)
    if (email.trim().toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      return null;
    }

    // Bcrypt password hash check
    const isPasswordValid = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
    if (!isPasswordValid) {
      return null;
    }

    return this.adminUser;
  }

  public static generateToken(user: UserPayload): string {
    return jwt.sign(
      {
        email: user.email,
        name: user.name,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );
  }

  public static verifyToken(token: string): UserPayload | null {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as UserPayload;
      if (decoded && decoded.email === env.ADMIN_EMAIL) {
        return {
          email: decoded.email,
          name: decoded.name || this.adminUser.name,
          role: decoded.role || this.adminUser.role,
        };
      }
      return null;
    } catch {
      return null;
    }
  }
}
