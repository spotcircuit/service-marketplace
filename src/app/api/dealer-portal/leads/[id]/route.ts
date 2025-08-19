import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/neon';

// PATCH: Update lead status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user || (user.role !== 'business_owner' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!user.business_id) {
      return NextResponse.json(
        { error: 'No business linked to account' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, notes, quoted_amount } = body;

    // Update lead assignment
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Track when contacted
    if (status === 'contacted') {
      updateData.contacted_at = new Date().toISOString();

      // Calculate response time from quote creation
      const quoteData = await sql`
        SELECT created_at
        FROM quotes
        WHERE id = ${id}::uuid
      `;

      if (quoteData[0]) {
        const createdAt = new Date(quoteData[0].created_at);
        const contactedAt = new Date();
        const responseMinutes = Math.floor((contactedAt.getTime() - createdAt.getTime()) / 60000);
        updateData.response_time_minutes = responseMinutes;
      }
    }

    if (notes) updateData.notes = notes;
    if (quoted_amount) updateData.quoted_amount = quoted_amount;

    // Persist "contacted" as archived state (viewed) but still track analytics and contacted_at
    const persistedStatus = status === 'contacted' ? 'viewed' : status;

    // Upsert into quote_business_tracking to track this business's interaction with the quote
    await sql`
      INSERT INTO quote_business_tracking (
        quote_id,
        business_id,
        status,
        updated_at,
        contacted_at,
        response_time_minutes,
        notes,
        quoted_amount
      ) VALUES (
        ${id}::uuid,
        ${user.business_id}::uuid,
        ${persistedStatus},
        NOW(),
        CASE WHEN ${status === 'contacted'} THEN NOW() ELSE NULL END,
        ${status === 'contacted' ? updateData.response_time_minutes || null : null},
        ${notes || null},
        ${quoted_amount || null}
      )
      ON CONFLICT (quote_id, business_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = NOW(),
        contacted_at = COALESCE(EXCLUDED.contacted_at, quote_business_tracking.contacted_at),
        response_time_minutes = COALESCE(EXCLUDED.response_time_minutes, quote_business_tracking.response_time_minutes),
        notes = COALESCE(EXCLUDED.notes, quote_business_tracking.notes),
        quoted_amount = COALESCE(EXCLUDED.quoted_amount, quote_business_tracking.quoted_amount)
    `;

    // Update analytics
    const today = new Date().toISOString().split('T')[0];
    if (status === 'contacted') {
      await sql`
        INSERT INTO business_analytics (business_id, date, leads_contacted)
        VALUES (${user.business_id}, ${today}, 1)
        ON CONFLICT (business_id, date)
        DO UPDATE SET leads_contacted = business_analytics.leads_contacted + 1
      `;

      // Note: We don't update the quotes table status since that's global
      // Each business tracks their own interaction status in quote_business_tracking
    } else if (status === 'won') {
      await sql`
        INSERT INTO business_analytics (business_id, date, leads_won, revenue_generated)
        VALUES (${user.business_id}, ${today}, 1, ${quoted_amount || 0})
        ON CONFLICT (business_id, date)
        DO UPDATE SET
          leads_won = business_analytics.leads_won + 1,
          revenue_generated = business_analytics.revenue_generated + ${quoted_amount || 0}
      `;
    }

    // Create notification
    await sql`
      INSERT INTO business_notifications (business_id, user_id, type, title, message)
      VALUES (
        ${user.business_id},
        ${user.id},
        'lead_update',
        'Lead Status Updated',
        ${`Lead status changed to ${status}`}
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Lead status updated successfully'
    });

  } catch (error) {
    console.error('Lead update error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}
