import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/neon';
import { getStateVariations } from '@/lib/state-utils';

// GET: Fetch shared leads (quotes) for the business based on service areas
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

    // Get business details including service areas
    const businessResult = await sql`
      SELECT city, state, service_areas
      FROM businesses
      WHERE id = ${user.business_id}::uuid
    `;

    if (!businessResult || businessResult.length === 0) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const business = businessResult[0];
    
    // Get state variations (both abbreviation and full name)
    const stateVariations = getStateVariations(business.state);
    
    // Get all quotes that match this business's service areas
    // Include whether this business has already revealed each lead
    const leads = await sql`
      SELECT 
        q.id,
        q.customer_name as name,
        q.customer_email as email,
        q.customer_phone as phone,
        q.customer_zipcode as zipcode,
        q.service_address,
        q.service_city,
        q.service_state,
        q.service_type,
        q.project_description,
        q.timeline,
        q.budget,
        q.created_at,
        -- Use quote_business_tracking for per-business status
        COALESCE(qbt.status, 'new') as status,
        qbt.contacted_at,
        CASE 
          WHEN lr.id IS NOT NULL THEN true
          ELSE false
        END as is_revealed,
        lr.revealed_at,
        qbt.notes
      FROM quotes q
      LEFT JOIN lead_reveals lr ON lr.lead_id = q.id 
        AND lr.business_id = ${user.business_id}::uuid
      LEFT JOIN quote_business_tracking qbt ON qbt.quote_id = q.id
        AND qbt.business_id = ${user.business_id}::uuid
      WHERE q.status != 'archived'
        AND (
          -- Match quotes in the business's city (handle state variations)
          (q.service_city = ${business.city} AND q.service_state = ANY(${stateVariations}))
          -- Or match quotes in the business's service areas
          OR q.service_city = ANY(
            SELECT jsonb_array_elements_text(${JSON.stringify(business.service_areas || [])}::jsonb)
          )
          -- Or match "city, state" format in service areas
          OR CONCAT(q.service_city, ', ', q.service_state) = ANY(
            SELECT jsonb_array_elements_text(${JSON.stringify(business.service_areas || [])}::jsonb)
          )
          -- Or if state matches and no city specified (handle variations)
          OR (q.service_state = ANY(${stateVariations}) AND (q.service_city IS NULL OR q.service_city = ''))
        )
      ORDER BY q.created_at DESC
      LIMIT 100
    `;

    // Mask contact info for unrevealed leads
    const maskedLeads = leads.map((lead: any) => {
      if (!lead.is_revealed) {
        return {
          ...lead,
          email: lead.email ? '****@****.***' : null,
          phone: lead.phone ? '(***) ***-****' : null,
          masked: true
        };
      }
      return {
        ...lead,
        masked: false
      };
    });

    // Get current lead credits
    const creditResult = await sql`
      SELECT lead_credits 
      FROM business_subscriptions 
      WHERE business_id = ${user.business_id}::uuid
    `;

    const leadCredits = creditResult[0]?.lead_credits || 0;

    return NextResponse.json({
      leads: maskedLeads,
      leadCredits,
      total: maskedLeads.length,
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