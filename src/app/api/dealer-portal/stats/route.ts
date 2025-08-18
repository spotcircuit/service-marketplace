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

    // First check if business has explicit lead assignments
    const assignedLeads = await sql`
      SELECT 
        la.id as assignment_id,
        la.status as assignment_status,
        la.assigned_at,
        q.id,
        q.service_type,
        q.service_city as city,
        q.service_state as state,
        q.customer_zipcode as zipcode,
        q.timeline,
        q.project_description,
        q.created_at,
        CASE 
          WHEN lr.id IS NOT NULL THEN true
          ELSE false
        END as is_revealed
      FROM lead_assignments la
      JOIN quotes q ON la.lead_id = q.id
      LEFT JOIN lead_reveals lr ON lr.lead_id = q.id 
        AND lr.business_id = ${user.business_id}::uuid
      WHERE la.business_id = ${user.business_id}::uuid
        AND q.status != 'archived'
      ORDER BY la.assigned_at DESC
    `;

    let allLeads = assignedLeads;
    let recentLeads = [];
    
    // If no assigned leads, fall back to area-based matching
    if (assignedLeads.length === 0) {
      const businessResult = await sql`
        SELECT city, state, service_areas
        FROM businesses
        WHERE id = ${user.business_id}::uuid
      `;

      const business = businessResult[0] || {};
      const { getStateVariations } = await import('@/lib/state-utils');
      const stateVariations = getStateVariations(business.state);

      allLeads = await sql`
        SELECT 
          q.id,
          q.service_type,
          q.service_city as city,
          q.service_state as state,
          q.customer_zipcode as zipcode,
          q.timeline,
          q.project_description,
          q.created_at,
          q.status,
          CASE 
            WHEN lr.id IS NOT NULL THEN true
            ELSE false
          END as is_revealed
        FROM quotes q
        LEFT JOIN lead_reveals lr ON lr.lead_id = q.id 
          AND lr.business_id = ${user.business_id}::uuid
        WHERE q.status != 'archived'
          AND (
            (q.service_city = ${business.city} AND q.service_state = ANY(${stateVariations}))
            OR q.service_city = ANY(
              SELECT jsonb_array_elements_text(${JSON.stringify(business.service_areas || [])}::jsonb)
            )
            OR CONCAT(q.service_city, ', ', q.service_state) = ANY(
              SELECT jsonb_array_elements_text(${JSON.stringify(business.service_areas || [])}::jsonb)
            )
            OR (q.service_state = ANY(${stateVariations}) AND (q.service_city IS NULL OR q.service_city = ''))
          )
        ORDER BY q.created_at DESC
      `;
    }

    // Calculate statistics
    const totalLeads = allLeads.length;
    const newLeads = allLeads.filter((l: any) => 
      !l.is_revealed && (!l.assignment_status || l.assignment_status === 'new')
    ).length;
    recentLeads = allLeads.filter((l: any) => 
      !l.is_revealed && (!l.assignment_status || l.assignment_status === 'new')
    ).slice(0, 5);

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

    // Return stats with explicit lead_credits field
    const subscriptionData = subscription[0] || {
      plan: 'free',
      credits: 10,
      used: 0
    };

    // Check if business is featured
    const businessData = await sql`
      SELECT is_featured, featured_until
      FROM businesses
      WHERE id = ${user.business_id}
    `;
    
    const isFeatured = businessData[0]?.is_featured && 
                       (!businessData[0]?.featured_until || 
                        new Date(businessData[0].featured_until) > new Date());

    return NextResponse.json({
      total_leads: totalLeads,
      new_leads: newLeads,
      weeklyLeads: allLeads.filter((l: any) => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(l.created_at) > weekAgo;
      }).length,
      listing_views: parseInt(analytics[0]?.total_views || 0),
      averageRating: parseFloat(businessMetrics[0]?.average_rating || 0),
      reviewCount: parseInt(businessMetrics[0]?.review_count || 0),
      conversion_rate: conversionRate,
      response_rate: 85, // Placeholder - calculate from actual response data
      lead_credits: subscriptionData.credits || 0,  // Explicit field for leads page
      subscription: subscriptionData,
      active_subscription: subscriptionData.status === 'active',
      is_featured: isFeatured,
      recent_leads: recentLeads || []
    });

  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
