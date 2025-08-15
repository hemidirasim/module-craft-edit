import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export interface User {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthSession {
  user: User;
  access_token: string;
  expires_at: Date;
}

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  private static JWT_EXPIRES_IN = '24h';

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  static verifyToken(token: string): { userId: string; email: string } | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      return { userId: decoded.userId, email: decoded.email };
    } catch (error) {
      return null;
    }
  }

  static async signUp(email: string, password: string): Promise<AuthSession> {
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await prisma.users.create({
      data: {
        email,
        password_hash: hashedPassword,
      }
    });

    // Generate token
    const access_token = this.generateToken(user);
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return {
      user,
      access_token,
      expires_at
    };
  }

  static async signIn(email: string, password: string): Promise<AuthSession> {
    // Find user
    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user || !user.password_hash) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const access_token = this.generateToken(user);
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return {
      user,
      access_token,
      expires_at
    };
  }

  static async getUserFromToken(token: string): Promise<User | null> {
    const decoded = this.verifyToken(token);
    if (!decoded) return null;

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId }
    });

    return user;
  }

  static async createDemoUser(): Promise<AuthSession> {
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create demo user
    const user = await prisma.demo_users.create({
      data: {
        session_id: sessionId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

    // Generate token
    const access_token = this.generateToken({
      id: user.id,
      email: `demo_${user.id}@demo.com`,
      created_at: user.created_at || new Date(),
      updated_at: user.updated_at || new Date(),
    });

    return {
      user: {
        id: user.id,
        email: `demo_${user.id}@demo.com`,
        created_at: user.created_at || new Date(),
        updated_at: user.updated_at || new Date(),
      },
      access_token,
      expires_at: user.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }
}
