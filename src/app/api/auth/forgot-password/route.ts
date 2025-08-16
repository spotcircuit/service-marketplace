import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if database is configured
    if (!sql) {
      // For demo purposes, just return success
      console.log(`Password reset requested for: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    // Check if user exists
    const users = await sql`
      SELECT id, email, name FROM users WHERE email = ${email}
    `;

    if (users.length === 0) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

    // Store reset token in database
    await sql`
      UPDATE users
      SET reset_token = ${resetToken},
          reset_token_expires = ${resetExpires.toISOString()}
      WHERE id = ${user.id}
    `;

    // In production, send email with reset link
    // For now, just log it
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    console.log(`Password reset link for ${email}: ${resetLink}`);

    // TODO: Implement email sending
    // await sendPasswordResetEmail(user.email, user.name, resetLink);

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}