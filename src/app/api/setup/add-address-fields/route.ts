import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

export async function GET(request: NextRequest) {
  try {
    // Check if database is configured
    if (!sql) {
      return NextResponse.json({
        error: 'Database not configured'
      }, { status: 500 });
    }

    // Check if columns already exist
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('address', 'city', 'state', 'zipcode')
    `;

    if (columnCheck.length === 4) {
      return NextResponse.json({
        success: true,
        message: 'Address fields already exist',
        columns: columnCheck
      });
    }

    // Add address columns if they don't exist
    await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS address VARCHAR(255),
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS zipcode VARCHAR(20)
    `;

    // Create indexes for better performance  
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_users_city ON users(city)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_users_state ON users(state)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_users_zipcode ON users(zipcode)`;
    } catch (e) {
      // Indexes might already exist
      console.log('Indexes might already exist:', e);
    }

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
      ORDER BY column_name
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