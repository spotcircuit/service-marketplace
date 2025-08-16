import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/neon';

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    const body = await request.json();
    const { current_password, new_password } = body;

    // Validate required fields
    if (!current_password || !new_password) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }

    // Validate password length
    if (new_password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // Get current user password hash
    const userResult = await sql`
      SELECT id, password_hash FROM users WHERE id = ${userId}
    `;

    if (userResult.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(current_password, userResult[0].password_hash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await sql`
      UPDATE users 
      SET 
        password_hash = ${hashedPassword},
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    return NextResponse.json({ 
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}