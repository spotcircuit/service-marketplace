import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if database is configured
    if (!sql) {
      return NextResponse.json({
        error: 'Database not configured'
      }, { status: 500 });
    }

    // Add home address columns if they don't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS address VARCHAR(255),
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS zipcode VARCHAR(20)
    `;

    // Add business address columns for business owners
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS business_address VARCHAR(255),
      ADD COLUMN IF NOT EXISTS business_city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS business_state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS business_zipcode VARCHAR(20),
      ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS business_phone VARCHAR(20)
    `;

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_users_city ON users(city)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_state ON users(state)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_zipcode ON users(zipcode)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_business_city ON users(business_city)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_business_state ON users(business_state)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_business_zipcode ON users(business_zipcode)`;

    // Update addresses for specified accounts
    const userEmails = ['brian@spotcircuit.com', 'novahokie1998@gmail.com', 'info@spotcircuit.com'];
    const addressData = {
      address: '43229 Somerset Hills Ter',
      city: 'Ashburn',
      state: 'Virginia',
      zipcode: '20147'
    };

    const updates = [];
    
    // Update each user
    for (const email of userEmails) {
      try {
        const result = await sql`
          UPDATE users 
          SET 
            address = ${addressData.address},
            city = ${addressData.city},
            state = ${addressData.state},
            zipcode = ${addressData.zipcode},
            updated_at = NOW()
          WHERE email = ${email}
          RETURNING email, name, address, city, state, zipcode
        `;
        
        if (result.length > 0) {
          updates.push(result[0]);
        }
      } catch (error) {
        console.error(`Error updating ${email}:`, error);
      }
    }

    // Verify all columns exist
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('address', 'city', 'state', 'zipcode')
    `;

    return NextResponse.json({
      success: true,
      message: 'Address fields migration completed',
      columnsAdded: tableInfo,
      usersUpdated: updates,
      totalUpdated: updates.length
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate address fields', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}