import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// This function assigns quotes to businesses based on service area matching
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quoteId, city, state, zipcode, lat, lng } = body;

    // Find businesses that service this area
    // Priority order:
    // 1. Businesses with matching service_areas (city/state)
    // 2. Businesses in the same city
    // 3. Businesses in the same state within reasonable distance
    
    // First try to find businesses that explicitly list this city in their service areas
    let businesses = await sql`
      SELECT DISTINCT b.id, b.name, b.is_featured, b.featured_until,
             bs.lead_credits, b.created_at,
             CASE 
               WHEN b.is_featured = true AND b.featured_until > NOW() THEN 1
               ELSE 2
             END as priority
      FROM businesses b
      LEFT JOIN business_subscriptions bs ON b.id = bs.business_id
      WHERE (
          b.is_claimed = true OR b.is_verified = true
        )
        AND (
          -- Check if city is in their service_areas JSON array
          b.service_areas::jsonb @> ${JSON.stringify([city])}::jsonb
          -- Or check if they're in the same city
          OR (b.city = ${city} AND b.state = ${state})
          -- Or check if "city, state" is in their service areas
          OR b.service_areas::jsonb @> ${JSON.stringify([`${city}, ${state}`])}::jsonb
        )
      ORDER BY priority, b.created_at DESC
      LIMIT 10
    `;

    // If no businesses found in the specific city, try broader state search
    if (businesses.length === 0 && state) {
      businesses = await sql`
        SELECT DISTINCT b.id, b.name, b.is_featured, b.featured_until,
               bs.lead_credits,
               CASE 
                 WHEN b.is_featured = true AND b.featured_until > NOW() THEN 1
                 ELSE 2
               END as priority
        FROM businesses b
        LEFT JOIN business_subscriptions bs ON b.id = bs.business_id
        WHERE (
            b.is_claimed = true OR b.is_verified = true
          )
          AND b.state = ${state}
          AND b.category = 'Dumpster Rental'
        ORDER BY priority, b.created_at DESC
        LIMIT 5
      `;
    }

    if (businesses.length === 0) {
      console.log(`No businesses found for quote ${quoteId} in ${city}, ${state}`);
      return NextResponse.json({
        success: true,
        message: 'No businesses service this area yet',
        assigned: 0
      });
    }

    // Create lead assignments for each matching business
    const assignments = [];
    for (const business of businesses) {
      try {
        // Check if assignment already exists
        const existing = await sql`
          SELECT id FROM lead_assignments 
          WHERE lead_id = ${quoteId}::uuid 
            AND business_id = ${business.id}::uuid
        `;

        if (existing.length === 0) {
          const result = await sql`
            INSERT INTO lead_assignments (
              lead_id,
              business_id,
              status,
              assigned_at
            ) VALUES (
              ${quoteId}::uuid,
              ${business.id}::uuid,
              'new',
              NOW()
            )
            RETURNING id
          `;
          
          if (result.length > 0) {
            assignments.push({
              businessId: business.id,
              businessName: business.name,
              assignmentId: result[0].id
            });
          }
        }
      } catch (err) {
        console.error(`Failed to assign quote to business ${business.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Quote assigned to ${assignments.length} businesses`,
      assignments,
      totalBusinesses: businesses.length
    });

  } catch (error) {
    console.error('Error assigning quote:', error);
    return NextResponse.json(
      { error: 'Failed to assign quote to businesses' },
      { status: 500 }
    );
  }
}