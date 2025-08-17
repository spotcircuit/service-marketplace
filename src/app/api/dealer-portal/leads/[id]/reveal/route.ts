import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15
    const { id } = await params;
    
    // Get authenticated user
    const user = await getCurrentUser();
    
    if (!user || (user.role !== 'business_owner' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!user.business_id) {
      return NextResponse.json(
        { error: 'No business associated with user' },
        { status: 400 }
      );
    }

    // Check if business has credits
    const creditResult = await sql`
      SELECT lead_credits 
      FROM business_subscriptions 
      WHERE business_id = ${user.business_id}
    `;

    if (!creditResult || creditResult.length === 0) {
      // Create default subscription if it doesn't exist
      await sql`
        INSERT INTO business_subscriptions (business_id, user_id, plan, lead_credits, status)
        VALUES (${user.business_id}, ${user.id}, 'free', 10, 'active')
        ON CONFLICT (business_id) DO NOTHING
      `;
      
      // Re-fetch
      const newCreditResult = await sql`
        SELECT lead_credits FROM business_subscriptions WHERE business_id = ${user.business_id}
      `;
      
      if (!newCreditResult || newCreditResult.length === 0 || newCreditResult[0].lead_credits <= 0) {
        return NextResponse.json(
          { error: 'No lead credits available. Please purchase credits to reveal lead information.' },
          { status: 403 }
        );
      }
    } else if (creditResult[0].lead_credits <= 0) {
      return NextResponse.json(
        { error: 'No lead credits available. Please purchase credits to reveal lead information.' },
        { status: 403 }
      );
    }

    // Check if this is a valid quote
    const quoteResult = await sql`
      SELECT id, service_city, service_state
      FROM quotes
      WHERE id = ${id}::uuid
    `;

    if (!quoteResult || quoteResult.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const quote = quoteResult[0];

    // Check if business has already revealed this lead
    const revealCheck = await sql`
      SELECT id FROM lead_reveals
      WHERE lead_id = ${id}::uuid
        AND business_id = ${user.business_id}::uuid
    `;

    // If already revealed by this business, don't charge again
    if (revealCheck && revealCheck.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'You have already revealed this lead',
        credits_remaining: creditResult[0].lead_credits 
      });
    }

    // Begin transaction: Deduct credit and mark lead as revealed
    await sql`BEGIN`;

    try {
      // Deduct one credit
      await sql`
        UPDATE business_subscriptions
        SET 
          lead_credits = lead_credits - 1,
          leads_received = COALESCE(leads_received, 0) + 1,
          updated_at = NOW()
        WHERE business_id = ${user.business_id}
          AND lead_credits > 0
      `;

      // Update lead assignment status if exists
      await sql`
        UPDATE lead_assignments
        SET 
          status = CASE 
            WHEN status = 'new' THEN 'contacted'
            ELSE status
          END,
          updated_at = NOW()
        WHERE lead_id = ${id}::uuid
          AND business_id = ${user.business_id}::uuid
      `;

      // Record the reveal transaction
      await sql`
        INSERT INTO lead_reveals (
          lead_id, 
          business_id, 
          user_id, 
          credits_used,
          revealed_at
        ) VALUES (
          ${id}::uuid,
          ${user.business_id}::uuid,
          ${user.id}::uuid,
          1,
          NOW()
        )
      `;

      await sql`COMMIT`;

      // Get updated credit count
      const updatedCredits = await sql`
        SELECT lead_credits 
        FROM business_subscriptions 
        WHERE business_id = ${user.business_id}
      `;

      return NextResponse.json({
        success: true,
        message: 'Lead contact information revealed',
        credits_remaining: updatedCredits[0].lead_credits
      });

    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }

  } catch (error) {
    console.error('Error revealing lead:', error);
    return NextResponse.json(
      { error: 'Failed to reveal lead information' },
      { status: 500 }
    );
  }
}