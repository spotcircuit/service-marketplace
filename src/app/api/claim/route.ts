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
      businessName,
      email,
      password,
      name,
      phone,
      role,
      businessLicense,
      claimStatus,
      // New business fields
      businessAddress,
      businessCity,
      businessState,
      businessZipcode,
      businessPhone,
      businessEmail,
      businessWebsite,
      businessCategory,
      verificationMethod,
      verificationCode,
      claimToken // Add support for claim token
    } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let finalBusinessId = businessId;
    let business;

    // Check if this is a new business (temporary ID starting with "new-")
    if (businessId && businessId.startsWith('new-')) {
      console.log('Creating new business with data:', {
        businessName,
        businessAddress,
        businessCity,
        businessState,
        businessZipcode,
        businessPhone,
        businessWebsite,
        businessCategory
      });
      
      // Create new business
      const newBusinesses = await sql`
        INSERT INTO businesses (
          name,
          address,
          city,
          state,
          zipcode,
          phone,
          website,
          category,
          is_claimed,
          is_verified,
          owner_name,
          owner_email,
          owner_phone,
          created_at,
          updated_at
        ) VALUES (
          ${businessName || 'Unnamed Business'},
          ${businessAddress || ''},
          ${businessCity || ''},
          ${businessState || ''},
          ${businessZipcode || ''},
          ${businessPhone || phone || ''},
          ${businessWebsite || ''},
          ${businessCategory || 'Dumpster Rental'},
          ${claimStatus === 'pending' ? false : true},
          ${claimStatus === 'pending' ? false : true},
          ${name},
          ${email},
          ${phone || ''},
          NOW(),
          NOW()
        )
        RETURNING id, name as business_name, is_claimed, owner_email
      `;
      
      if (newBusinesses.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create business' },
          { status: 500 }
        );
      }
      
      business = newBusinesses[0];
      finalBusinessId = business.id;
    } else if (businessId) {
      // Check if existing business exists and is not already claimed
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

      business = businesses[0];
      finalBusinessId = business.id;

      if (business.is_claimed && claimStatus !== 'pending') {
        return NextResponse.json(
          { error: 'This business has already been claimed' },
          { status: 400 }
        );
      }
    } else {
      // No business specified - this shouldn't happen
      return NextResponse.json(
        { error: 'Business information required' },
        { status: 400 }
      );
    }

    // TODO: Implement proper email verification
    // For now, we'll skip verification during development

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
          business_id = ${finalBusinessId},
          company_name = ${business.business_name || business.name},
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
          business_id = ${finalBusinessId},
          company_name = ${business.business_name || business.name},
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

    // Update business to mark as claimed (or pending if specified)
    if (claimStatus === 'pending') {
      // Create a pending claim record
      await sql`
        INSERT INTO pending_claims (business_id, user_id, status, created_at)
        VALUES (${finalBusinessId}, ${userId}, 'pending', NOW())
        ON CONFLICT (business_id, user_id) DO NOTHING
      `;
    } else {
      // Mark as claimed immediately and update optional fields if provided
      await sql`
        UPDATE businesses
        SET
          is_claimed = true,
          is_verified = true,
          owner_name = ${name},
          owner_email = ${email},
          owner_phone = ${phone},
          email = COALESCE(NULLIF(${businessEmail || ''}, ''), email),
          website = COALESCE(NULLIF(${businessWebsite || ''}, ''), website),
          updated_at = NOW()
        WHERE id = ${finalBusinessId}
      `;
    }

    // Update user with business_id
    await sql`
      UPDATE users
      SET business_id = ${finalBusinessId}
      WHERE id = ${userId}
    `;

    // Create initial subscription for lead notifications
    await sql`
      INSERT INTO business_subscriptions (business_id, user_id, plan, status, lead_credits)
      VALUES (${finalBusinessId}, ${userId}, 'free', 'active', 10)
      ON CONFLICT (business_id) DO NOTHING
    `;

    // Track claim completion if we have a token
    if (claimToken) {
      try {
        // Update campaign to track account creation and claim completion
        await sql`
          UPDATE claim_campaigns 
          SET 
            account_created_at = COALESCE(account_created_at, NOW()),
            claim_completed_at = NOW(),
            claimed_at = NOW(),
            claimed_by_user_id = ${userId},
            updated_at = NOW()
          WHERE claim_token = ${claimToken}
        `;
      } catch (trackError) {
        console.error('Failed to track claim completion:', trackError);
        // Don't fail the claim if tracking fails
      }
    }

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
      redirect: '/dealer-portal',
      userId: userId // Return userId for frontend tracking
    });

  } catch (error) {
    console.error('Claim error:', error);
    return NextResponse.json(
      { error: 'Failed to claim business' },
      { status: 500 }
    );
  }
}
