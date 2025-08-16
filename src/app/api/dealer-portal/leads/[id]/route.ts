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

      // Calculate response time
      const leadData = await sql`
        SELECT la.assigned_at
        FROM lead_assignments la
        WHERE la.lead_id = ${id} AND la.business_id = ${user.business_id}
      `;

      if (leadData[0]) {
        const assignedAt = new Date(leadData[0].assigned_at);
        const contactedAt = new Date();
        const responseMinutes = Math.floor((contactedAt.getTime() - assignedAt.getTime()) / 60000);
        updateData.response_time_minutes = responseMinutes;
      }
    }

    if (notes) updateData.notes = notes;
    if (quoted_amount) updateData.quoted_amount = quoted_amount;

    // Build update query
    const setClause = Object.keys(updateData)
      .map(key => `${key} = ${typeof updateData[key] === 'string' ? `'${updateData[key]}'` : updateData[key]}`)
      .join(', ');

    await sql`
      UPDATE lead_assignments
      SET status = ${status},
          updated_at = NOW(),
          contacted_at = ${status === 'contacted' ? 'NOW()' : sql`contacted_at`},
          notes = ${notes || sql`notes`},
          quoted_amount = ${quoted_amount || sql`quoted_amount`}
      WHERE lead_id = ${id} AND business_id = ${user.business_id}
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
