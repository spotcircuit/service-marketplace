import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function POST(request: NextRequest) {
  try {
    // This is an admin-only endpoint for updating specific user addresses
    // In production, you would add proper authentication and authorization
    
    const body = await request.json();
    const { adminKey } = body;
    
    // Simple admin key check (in production, use proper auth)
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, add address columns if they don't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS address VARCHAR(255),
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(50),
      ADD COLUMN IF NOT EXISTS zipcode VARCHAR(10)
    `;

    // Create indexes if they don't exist
    await sql`CREATE INDEX IF NOT EXISTS idx_users_city ON users(city)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_state ON users(state)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_zipcode ON users(zipcode)`;

    // Update the three specific user accounts
    const addressData = {
      address: '43229 Somerset Hills Ter',
      city: 'Ashburn',
      state: 'VA',
      zipcode: '20147'
    };

    const emails = [
      'brian@spotcircuit.com',
      'novahokie1998@gmail.com', 
      'info@spotcircuit.com'
    ];

    const updateResults = [];

    for (const email of emails) {
      const result = await sql`
        UPDATE users 
        SET 
          address = ${addressData.address},
          city = ${addressData.city},
          state = ${addressData.state},
          zipcode = ${addressData.zipcode},
          updated_at = NOW()
        WHERE email = ${email}
        RETURNING id, email, name, address, city, state, zipcode, updated_at
      `;

      if (result.length > 0) {
        updateResults.push({
          email,
          status: 'updated',
          user: result[0]
        });
      } else {
        updateResults.push({
          email,
          status: 'not_found',
          user: null
        });
      }
    }

    // Verify all updates
    const verificationResult = await sql`
      SELECT 
        email,
        name,
        address,
        city,
        state,
        zipcode,
        updated_at
      FROM users 
      WHERE email = ANY(${emails})
      ORDER BY email
    `;

    return NextResponse.json({
      message: 'User address update completed',
      updateResults,
      verification: verificationResult,
      addressData
    });

  } catch (error) {
    console.error('User address update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}