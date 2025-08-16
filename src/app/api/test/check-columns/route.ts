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

    // Check which columns exist in the users table
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;

    // Check if address columns exist
    const addressColumns = ['address', 'city', 'state', 'zipcode'];
    const existingColumns = columns.map((col: any) => col.column_name);
    const missingColumns = addressColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length > 0) {
      // Try to add the missing columns
      try {
        await sql`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS address VARCHAR(255),
          ADD COLUMN IF NOT EXISTS city VARCHAR(100),
          ADD COLUMN IF NOT EXISTS state VARCHAR(100),
          ADD COLUMN IF NOT EXISTS zipcode VARCHAR(20)
        `;

        return NextResponse.json({
          success: true,
          message: 'Address columns added successfully',
          addedColumns: missingColumns,
          allColumns: [...existingColumns, ...missingColumns]
        });
      } catch (alterError) {
        return NextResponse.json({
          success: false,
          message: 'Columns missing and could not be added',
          missingColumns,
          existingColumns,
          error: alterError instanceof Error ? alterError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'All address columns exist',
      columns: columns.map((col: any) => ({
        name: col.column_name,
        type: col.data_type
      }))
    });

  } catch (error) {
    console.error('Column check error:', error);
    return NextResponse.json(
      { error: 'Failed to check columns', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}