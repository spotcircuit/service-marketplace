import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

// GET: Fetch claim campaign statistics
export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await verifyToken(token.value);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total unclaimed businesses
    const unclaimedResult = await sql`
      SELECT COUNT(*) as total
      FROM businesses
      WHERE is_claimed = false
    `;
    
    // Get businesses with tokens (both claimed and unclaimed)
    const withTokensResult = await sql`
      SELECT COUNT(DISTINCT b.id) as total
      FROM businesses b
      INNER JOIN claim_campaigns cc ON cc.business_id = b.id
      WHERE cc.claim_token IS NOT NULL
    `;
    
    // Get businesses where emails have been sent
    const emailsSentResult = await sql`
      SELECT COUNT(DISTINCT b.id) as total
      FROM businesses b
      INNER JOIN claim_campaigns cc ON cc.business_id = b.id
      WHERE cc.email_sent_at IS NOT NULL
    `;
    
    // Additional stats
    const totalBusinesses = await sql`
      SELECT COUNT(*) as total FROM businesses
    `;
    
    const withEmailResult = await sql`
      SELECT COUNT(*) as total
      FROM businesses
      WHERE email IS NOT NULL AND email != ''
    `;
    
    const claimedResult = await sql`
      SELECT COUNT(*) as total
      FROM businesses
      WHERE is_claimed = true
    `;
    
    return NextResponse.json({
      totalUnclaimed: parseInt(unclaimedResult[0]?.total || '0'),
      withTokens: parseInt(withTokensResult[0]?.total || '0'),
      emailsSent: parseInt(emailsSentResult[0]?.total || '0'),
      totalBusinesses: parseInt(totalBusinesses[0]?.total || '0'),
      withEmail: parseInt(withEmailResult[0]?.total || '0'),
      claimed: parseInt(claimedResult[0]?.total || '0')
    });

  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}