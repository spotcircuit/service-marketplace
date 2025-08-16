import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { createUser, generateToken, generateSessionToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// POST: Claim a business listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      email,
      password,
      name,
      phone,
      verificationMethod,
      verificationCode
    } = body;

    // Validate input
    if (!businessId || !email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if business exists and is not already claimed
    const businesses = await sql`
      SELECT id, name as business_name, is_claimed, owner_email
      FROM businesses
      WHERE id = ${businessId}
    `;

    if (businesses.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const business = businesses[0];

    if (business.is_claimed) {
      return NextResponse.json(
        { error: 'This business has already been claimed' },
        { status: 400 }
      );
    }

    // TODO: Verify ownership (email, phone, or documentation)
    // For now, we'll just check if the verification code matches
    if (verificationMethod === 'email' && verificationCode !== '123456') {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    let userId;
    let token;

    if (existingUsers.length > 0) {
      // User exists, just link the business
      userId = existingUsers[0].id;

      // Update user to business_owner role and link business
      await sql`
        UPDATE users
        SET
          role = 'business_owner',
          business_id = ${businessId},
          company_name = ${business.business_name},
          phone = COALESCE(phone, ${phone})
        WHERE id = ${userId}
      `;

      // Generate new session tokens
      token = generateToken(userId, email, 'business_owner');
      const sessionToken = generateSessionToken();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await sql`
        INSERT INTO sessions (user_id, token, expires_at)
        VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
      `;
    } else {
      // Create new user account
      const result = await createUser(email, password, name, 'business_owner');

      if (result.error) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      userId = result.user!.id;

      // Update user with business details
      await sql`
        UPDATE users
        SET
          business_id = ${businessId},
          company_name = ${business.business_name},
          phone = ${phone},
          email_verified = true
        WHERE id = ${userId}
      `;

      // Generate session tokens
      token = generateToken(userId, email, 'business_owner');
      const sessionToken = generateSessionToken();

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await sql`
        INSERT INTO sessions (user_id, token, expires_at)
        VALUES (${userId}, ${sessionToken}, ${expiresAt.toISOString()})
      `;
    }

    // Update business to mark as claimed
    await sql`
      UPDATE businesses
      SET
        is_claimed = true,
        is_verified = true,
        owner_name = ${name},
        owner_email = ${email},
        owner_phone = ${phone},
        updated_at = NOW()
      WHERE id = ${businessId}
    `;

    // Update user with business_id
    await sql`
      UPDATE users
      SET business_id = ${businessId}
      WHERE id = ${userId}
    `;

    // Create initial subscription for lead notifications
    await sql`
      INSERT INTO business_subscriptions (business_id, user_id, plan, status, lead_credits)
      VALUES (${businessId}, ${userId}, 'free', 'active', 10)
      ON CONFLICT (business_id) DO NOTHING
    `;

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json({
      success: true,
      message: 'Business claimed successfully!',
      redirect: '/dealer-portal'
    });

  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json(
      { error: 'Failed to claim business' },
      { status: 500 }
    );
  }
}
