import { NextRequest, NextResponse } from 'next/server';
import { createUser, generateToken, generateSessionToken } from '@/lib/auth';
import { sql } from '@/lib/neon';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      role = 'customer', 
      businessName,
      // Business details
      businessId,
      claim,
      category,
      address,
      city,
      state,
      zipcode,
      lat,
      lng,
      phone,
      website,
      description,
      services
    } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Create user
    const result = await createUser(email, password, name, role);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    if (!result.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // If business owner, create or claim business
    if (role === 'business_owner') {
      let business;
      
      if (businessId && claim === 'true') {
        // Claim existing business
        const existingBusiness = await sql`
          UPDATE businesses
          SET 
            is_claimed = true,
            owner_email = ${email},
            owner_name = ${name},
            owner_phone = ${phone || null},
            updated_at = NOW()
          WHERE id = ${businessId}::uuid
          RETURNING id
        `;
        
        if (existingBusiness && existingBusiness.length > 0) {
          business = existingBusiness[0];
        }
      } else {
        // Create new business
        const newBusiness = await sql`
          INSERT INTO businesses (
            name,
            category,
            description,
            phone,
            email,
            website,
            address,
            city,
            state,
            zipcode,
            latitude,
            longitude,
            is_claimed,
            is_verified,
            owner_name,
            owner_email,
            owner_phone,
            services
          ) VALUES (
            ${businessName},
            ${category || 'Other'},
            ${description || null},
            ${phone},
            ${email},
            ${website || null},
            ${address},
            ${city},
            ${state},
            ${zipcode},
            ${lat || null},
            ${lng || null},
            true,
            true,
            ${name},
            ${email},
            ${phone || null},
            ${services ? JSON.stringify(services) : null}
          )
          RETURNING id
        `;
        
        if (newBusiness && newBusiness.length > 0) {
          business = newBusiness[0];
        }
      }
      
      // Link business to user
      if (business) {
        await sql`
          UPDATE users
          SET 
            business_id = ${business.id}::uuid,
            company_name = ${businessName}
          WHERE id = ${result.user.id}
        `;
      }
    }

    // Generate tokens
    const jwtToken = generateToken(result.user.id, result.user.email, result.user.role);
    const sessionToken = generateSessionToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${result.user.id}, ${sessionToken}, ${expiresAt.toISOString()})
    `;

    // Set cookie with JWT token
    const cookieStore = await cookies();
    cookieStore.set('auth-token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json({
      success: true,
      user: result.user,
      redirect: role === 'business_owner' ? '/dealer-portal' : '/dashboard'
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
