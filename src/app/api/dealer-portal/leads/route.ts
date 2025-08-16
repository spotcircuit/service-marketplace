import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/neon';

// GET: Fetch leads for the business
export async function GET(request: NextRequest) {
  try {
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

    // Get assigned leads with full details
    const leads = await sql`
      SELECT
        l.id,
        l.name,
        l.email,
        l.phone,
        l.zipcode,
        l.service_type,
        l.project_description,
        l.timeline,
        l.budget,
        l.created_at,
        la.status,
        la.viewed_at,
        la.contacted_at,
        la.response_time_minutes,
        la.quoted_amount,
        la.notes
      FROM leads l
      INNER JOIN lead_assignments la ON l.id = la.lead_id
      WHERE la.business_id = ${user.business_id}
      ORDER BY l.created_at DESC
    `;

    // Mark new leads as viewed
    await sql`
      UPDATE lead_assignments
      SET
        status = CASE
          WHEN status = 'new' THEN 'viewed'
          ELSE status
        END,
        viewed_at = CASE
          WHEN viewed_at IS NULL THEN NOW()
          ELSE viewed_at
        END
      WHERE business_id = ${user.business_id}
      AND status = 'new'
    `;

    // Update analytics
    const today = new Date().toISOString().split('T')[0];
    await sql`
      INSERT INTO business_analytics (business_id, date, profile_views)
      VALUES (${user.business_id}, ${today}, 0)
      ON CONFLICT (business_id, date) DO NOTHING
    `;

    return NextResponse.json({
      leads,
      success: true
    });

  } catch (error) {
    console.error('Leads fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
