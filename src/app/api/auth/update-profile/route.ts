import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest) {
  try {
    // Get auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get user
    const payload = verifyToken(token.value);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone } = body;

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    const existingUser = await sql`
      SELECT id FROM users 
      WHERE email = ${email} AND id != ${payload.userId}::uuid
    `;

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 400 }
      );
    }

    // Update user profile
    const result = await sql`
      UPDATE users
      SET
        name = ${name},
        email = ${email},
        phone = ${phone || null},
        updated_at = NOW()
      WHERE id = ${payload.userId}::uuid
      RETURNING id, email, name, phone, role
    `;

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result[0]
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}