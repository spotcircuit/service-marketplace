import { NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { testConnection as testNeonConnection } from '@/lib/neon';
import { supabase } from '@/lib/supabase';

// GET: Test database connection and configuration
export async function GET() {
  try {
    // Test main database connection
    const connectionTest = await database.testConnection();

    // Get environment info
    const envInfo = {
      hasNeonUrl: !!process.env.DATABASE_URL || !!process.env.NEXT_PUBLIC_NEON_DATABASE_URL,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      databaseType: process.env.NEXT_PUBLIC_DATABASE_TYPE || 'auto-detected',
      nodeEnv: process.env.NODE_ENV,
    };

    // Test data retrieval
    let dataTest: { success: boolean; message: string; source?: string } = { success: false, message: 'Not tested' };
    try {
      const businesses = await database.getBusinesses({ limit: 1 });
      dataTest = {
        success: true,
        message: `Retrieved ${businesses.businesses.length} businesses from ${businesses.source}`,
        source: businesses.source
      };
    } catch (error) {
      dataTest = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        source: 'unknown'
      };
    }

    return NextResponse.json({
      connection: connectionTest,
      environment: envInfo,
      dataTest,
      recommendation: getRecommendation(connectionTest, envInfo),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to test database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getRecommendation(connectionTest: any, envInfo: any) {
  if (connectionTest.success && connectionTest.type === 'neon') {
    return {
      status: 'healthy',
      message: 'Neon database is configured and working correctly',
      next_steps: []
    };
  }

  if (connectionTest.success && connectionTest.type === 'supabase') {
    return {
      status: 'healthy',
      message: 'Supabase database is configured and working correctly',
      next_steps: ['Consider migrating to Neon for better performance']
    };
  }

  if (!envInfo.hasNeonUrl && !envInfo.hasSupabaseUrl) {
    return {
      status: 'not_configured',
      message: 'No database configured. Using sample data.',
      next_steps: [
        'Create a Neon account at neon.tech',
        'Follow the setup guide in NEON_SETUP.md',
        'Add DATABASE_URL to your environment variables'
      ]
    };
  }

  return {
    status: 'error',
    message: 'Database is configured but not working correctly',
    next_steps: [
      'Check your database credentials',
      'Ensure the database schema is created',
      'Check network connectivity'
    ]
  };
}
