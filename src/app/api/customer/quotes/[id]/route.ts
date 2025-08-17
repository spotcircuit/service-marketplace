import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/customer/quotes/[id] - Fetch single quote details for the authenticated user
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params in Next.js 15
    const { id: quoteId } = await params;
    
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

    // Fetch quote details scoped to the authenticated user
    const result = await sql`
      SELECT 
        q.*,
        (
          SELECT json_agg(qr.*)
          FROM quote_responses qr
          WHERE qr.quote_id = q.id
        ) as responses
      FROM quotes q
      WHERE q.id = ${quoteId} AND q.customer_id = ${userId}
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    return NextResponse.json({
      quote: result[0],
    });
  } catch (error) {
    console.error('Error fetching quote details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote details' },
      { status: 500 }
    );
  }
}
