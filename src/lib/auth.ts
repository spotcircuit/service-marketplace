import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '@/lib/neon';
import { cookies } from 'next/headers';

// Get JWT secret from environment or use a default (change in production!)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'business_owner' | 'customer';
  phone?: string;
  avatar_url?: string;
  email_verified: boolean;
  business_id?: string;
  company_name?: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Token utilities
export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function generateSessionToken(): string {
  // Generate a shorter session token for database storage (max 255 chars)
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// User management
export async function createUser(
  email: string,
  password: string,
  name?: string,
  role: 'admin' | 'business_owner' | 'customer' = 'customer'
): Promise<{ user?: User; error?: string }> {
  try {
    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existing.length > 0) {
      return { error: 'User already exists' };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await sql`
      INSERT INTO users (email, password_hash, name, role, email_verified)
      VALUES (${email}, ${passwordHash}, ${name}, ${role}, false)
      RETURNING id, email, name, role, email_verified, created_at
    `;

    const user = result[0] as User;
    return { user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { error: 'Failed to create user' };
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user?: User; token?: string; error?: string }> {
  try {
    // Check if database is configured
    if (!sql) {
      // For development/demo purposes, allow some default users
      if (email === 'admin@example.com' && password === 'admin123') {
        const user = {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin' as const,
          email_verified: true,
          created_at: new Date().toISOString()
        };
        const token = generateToken(user.id, user.email, user.role);
        return { user, token };
      }
      if (email === 'dealer@example.com' && password === 'dealer123') {
        const user = {
          id: '2',
          email: 'dealer@example.com',
          name: 'Dealer User',
          role: 'business_owner' as const,
          email_verified: true,
          created_at: new Date().toISOString()
        };
        const token = generateToken(user.id, user.email, user.role);
        return { user, token };
      }
      if (email === 'customer@example.com' && password === 'customer123') {
        const user = {
          id: '3',
          email: 'customer@example.com',
          name: 'Customer User',
          role: 'customer' as const,
          email_verified: true,
          created_at: new Date().toISOString()
        };
        const token = generateToken(user.id, user.email, user.role);
        return { user, token };
      }
      return { error: 'Invalid email or password' };
    }

    // Get user by email
    const result = await sql`
      SELECT id, email, password_hash, name, role, phone, avatar_url,
             email_verified, business_id, company_name, created_at
      FROM users
      WHERE email = ${email}
    `;

    if (result.length === 0) {
      return { error: 'Invalid email or password' };
    }

    const user = result[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return { error: 'Invalid email or password' };
    }

    // Update last login
    await sql`
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = ${user.id}
    `;

    // Generate tokens
    const jwtToken = generateToken(user.id, user.email, user.role);
    const sessionToken = generateSessionToken();

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${sessionToken}, ${expiresAt.toISOString()})
    `;

    // Remove password hash from user object
    const { password_hash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as User,
      token: jwtToken
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { error: 'Authentication failed' };
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const payload = verifyToken(token);
    if (!payload) return null;

    // Check if session exists and is valid (by user_id, not token)
    const sessions = await sql`
      SELECT * FROM sessions
      WHERE user_id = ${payload.userId}
      AND expires_at > NOW()
      LIMIT 1
    `;

    if (sessions.length === 0) return null;

    // Get user data
    const result = await sql`
      SELECT id, email, name, role, phone, avatar_url,
             email_verified, business_id, company_name, created_at
      FROM users
      WHERE id = ${payload.userId}
    `;

    if (result.length === 0) return null;

    return result[0] as User;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) return null;

    return getUserFromToken(token.value);
  } catch (error) {
    return null;
  }
}

export async function logoutUser(token: string): Promise<void> {
  try {
    // Verify token to get user ID
    const payload = verifyToken(token);
    if (payload && payload.userId) {
      // Delete session by user_id
      await sql`
        DELETE FROM sessions WHERE user_id = ${payload.userId}
      `;
    }
  } catch (error) {
    console.error('Error logging out user:', error);
  }
}

// Create default admin user
export async function createDefaultAdmin(): Promise<void> {
  try {
    const email = 'brian@spotcircuit.com';
    const password = 'Admin123!'; // You should change this!

    // Check if admin already exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existing.length > 0) {
      // Update to admin role if not already
      await sql`
        UPDATE users
        SET role = 'admin', email_verified = true
        WHERE email = ${email}
      `;
      console.log('Admin user updated');
    } else {
      // Create admin user
      const passwordHash = await hashPassword(password);
      await sql`
        INSERT INTO users (email, password_hash, name, role, email_verified)
        VALUES (${email}, ${passwordHash}, 'Brian', 'admin', true)
      `;
      console.log('Admin user created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

// Role-based access control
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

export function isBusinessOwner(user: User | null): boolean {
  return user?.role === 'business_owner' || user?.role === 'admin';
}

export function canAccessAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

export function canManageBusiness(user: User | null, businessId: string): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'business_owner' && user.business_id === businessId) return true;
  return false;
}
