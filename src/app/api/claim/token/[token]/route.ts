import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';

// GET: Fetch business details by claim token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Fetch campaign and business details
    const result = await sql`
      SELECT 
        cc.id as campaign_id,
        cc.claim_token,
        cc.expires_at,
        cc.claimed_at,
        b.id,
        b.name,
        b.email,
        b.phone,
        b.address,
        b.city,
        b.state,
        b.zipcode,
        b.category,
        b.website,
        b.is_claimed
      FROM claim_campaigns cc
      JOIN businesses b ON cc.business_id = b.id
      WHERE cc.claim_token = ${token}
      LIMIT 1
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      );
    }

    const campaign = result[0];

    // Check if token has expired
    if (new Date(campaign.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This claim link has expired' },
        { status: 410 }
      );
    }

    // Check if already claimed
    if (campaign.is_claimed || campaign.claimed_at) {
      return NextResponse.json(
        { error: 'This business has already been claimed' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      business: {
        id: campaign.id,
        name: campaign.name,
        email: campaign.email,
        phone: campaign.phone,
        address: campaign.address,
        city: campaign.city,
        state: campaign.state,
        zipcode: campaign.zipcode,
        category: campaign.category,
        website: campaign.website
      },
      campaign: {
        id: campaign.campaign_id,
        token: campaign.claim_token,
        expires_at: campaign.expires_at
      }
    });

  } catch (error) {
    console.error('Error fetching business by token:', error);
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    );
  }
}