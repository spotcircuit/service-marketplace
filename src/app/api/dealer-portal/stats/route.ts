import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/neon';

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

    // Get lead statistics
    const leadStats = await sql`
      SELECT
        COUNT(*) as total_leads,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_leads,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as weekly_leads
      FROM lead_assignments
      WHERE business_id = ${user.business_id}
    `;

    // Get business metrics
    const businessMetrics = await sql`
      SELECT
        rating as average_rating,
        reviews as review_count
      FROM businesses
      WHERE id = ${user.business_id}
    `;

    // Get current month analytics
    const currentMonth = new Date().toISOString().slice(0, 7);
    const analytics = await sql`
      SELECT
        SUM(profile_views) as total_views,
        SUM(quote_requests) as total_quotes,
        SUM(leads_won) as leads_won,
        SUM(leads_contacted) as leads_contacted
      FROM business_analytics
      WHERE business_id = ${user.business_id}
      AND date >= ${currentMonth + '-01'}
    `;

    // Get subscription info
    const subscription = await sql`
      SELECT
        plan,
        lead_credits as credits,
        leads_received as used,
        status
      FROM business_subscriptions
      WHERE business_id = ${user.business_id}
    `;

    // Calculate conversion rate
    const totalContacted = analytics[0]?.leads_contacted || 0;
    const totalWon = analytics[0]?.leads_won || 0;
    const conversionRate = totalContacted > 0
      ? Math.round((totalWon / totalContacted) * 100)
      : 0;

    return NextResponse.json({
      totalLeads: parseInt(leadStats[0]?.total_leads || 0),
      newLeads: parseInt(leadStats[0]?.new_leads || 0),
      weeklyLeads: parseInt(leadStats[0]?.weekly_leads || 0),
      totalViews: parseInt(analytics[0]?.total_views || 0),
      averageRating: parseFloat(businessMetrics[0]?.average_rating || 0),
      reviewCount: parseInt(businessMetrics[0]?.review_count || 0),
      conversionRate,
      subscription: subscription[0] || {
        plan: 'free',
        credits: 10,
        used: 0
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
