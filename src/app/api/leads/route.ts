import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';

// GET: Fetch leads (admin only in production)
export async function GET(request: NextRequest) {
  try {
    // In production, this should check authentication
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get('business_id');
    const status = searchParams.get('status');

    const filters = {
      business_id: businessId,
      status
    };

    const result = await database.getLeads(filters);

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST: Create a new lead/quote request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phone || !body.service_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const leadData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      zipcode: body.zipcode || '',
      service_type: body.service_type,
      project_description: body.project_description || '',
      timeline: body.timeline || 'flexible',
      budget: body.budget,
      business_ids: body.business_ids || [],
      category: body.category,
      status: 'new',
      source: body.source || 'website',
    };

    const result = await database.createLead(leadData);

    // In production, you would:
    // 1. Send email notifications to businesses
    // 2. Send confirmation email to customer
    // 3. Track analytics

    if (result.lead?.business_ids && result.lead.business_ids.length > 0) {
      console.log(`Sending lead notifications to ${result.lead.business_ids.length} businesses`);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

// PATCH: Update lead status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing lead ID or status' },
        { status: 400 }
      );
    }

    const result = await database.updateLeadStatus(id, status);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}
