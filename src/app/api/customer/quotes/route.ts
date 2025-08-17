import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET: Fetch customer's quotes
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;

    // Fetch customer's quotes
    const quotes = await sql`
      SELECT 
        id,
        service_type,
        project_description,
        timeline,
        budget,
        status,
        service_address,
        service_city,
        service_state,
        service_area,
        business_id,
        business_name,
        created_at,
        updated_at,
        (
          SELECT COUNT(*) 
          FROM quote_responses qr 
          WHERE qr.quote_id = quotes.id
        ) as responses_count
      FROM quotes
      WHERE customer_id = ${userId}
      ORDER BY created_at DESC
    `;

    // Calculate stats
    const stats = {
      total_quotes: quotes.length,
      pending_quotes: quotes.filter(q => q.status === 'pending' || q.status === 'new').length,
      completed_quotes: quotes.filter(q => q.status === 'completed').length,
      total_responses: quotes.reduce((sum, q) => sum + (q.responses_count || 0), 0)
    };

    return NextResponse.json({
      quotes,
      stats
    });
  } catch (error) {
    console.error('Error fetching customer quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}