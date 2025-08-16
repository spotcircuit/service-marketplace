import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/neon';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Get user profile
    const result = await sql`
      SELECT id, name, email, phone, address, city, state, zipcode, role, created_at, updated_at
      FROM users 
      WHERE id = ${userId}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      user: result[0]
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    const body = await request.json();
    const { name, email, phone, address, city, state, zipcode } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Check if email is already taken by another user
    const emailCheck = await sql`
      SELECT id FROM users 
      WHERE email = ${email} AND id != ${userId}
    `;

    if (emailCheck.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Update user profile
    const result = await sql`
      UPDATE users 
      SET 
        name = ${name},
        email = ${email},
        phone = ${phone || null},
        address = ${address || null},
        city = ${city || null},
        state = ${state || null},
        zipcode = ${zipcode || null},
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, name, email, phone, address, city, state, zipcode, role
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: result[0]
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}