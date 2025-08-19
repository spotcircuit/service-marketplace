import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// POST: Track actions on claim campaign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const { action } = body;

    if (!token || !action) {
      return NextResponse.json(
        { error: 'Token and action are required' },
        { status: 400 }
      );
    }

    // Update tracking based on action
    let updateQuery;
    switch (action) {
      case 'email_opened':
        updateQuery = sql`
          UPDATE claim_campaigns 
          SET email_opened_at = COALESCE(email_opened_at, NOW()),
              updated_at = NOW()
          WHERE claim_token = ${token}
          RETURNING id
        `;
        break;
      
      case 'link_clicked':
        updateQuery = sql`
          UPDATE claim_campaigns 
          SET link_clicked_at = COALESCE(link_clicked_at, NOW()),
              updated_at = NOW()
          WHERE claim_token = ${token}
          RETURNING id
        `;
        break;
      
      case 'account_created':
        const userId = body.userId;
        updateQuery = sql`
          UPDATE claim_campaigns 
          SET account_created_at = COALESCE(account_created_at, NOW()),
              claimed_by_user_id = COALESCE(claimed_by_user_id, ${userId || null}),
              updated_at = NOW()
          WHERE claim_token = ${token}
          RETURNING id
        `;
        break;
      
      case 'claimed':
        updateQuery = sql`
          UPDATE claim_campaigns 
          SET claimed_at = NOW(),
              claim_completed_at = NOW(),
              updated_at = NOW()
          WHERE claim_token = ${token}
          RETURNING id, business_id
        `;
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const result = await updateQuery;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // If claimed, also update the business
    if (action === 'claimed' && result[0].business_id) {
      await sql`
        UPDATE businesses 
        SET is_claimed = true,
            updated_at = NOW()
        WHERE id = ${result[0].business_id}
      `;
    }

    return NextResponse.json({
      success: true,
      action,
      campaign_id: result[0].id
    });

  } catch (error) {
    console.error('Error tracking campaign action:', error);
    return NextResponse.json(
      { error: 'Failed to track action' },
      { status: 500 }
    );
  }
}