import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/neon';

// GET: Fetch subscription plans
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const plans = await sql`
      SELECT * FROM subscription_plans
      ORDER BY sort_order ASC, price ASC
    `;

    // Parse features JSON
    const parsedPlans = plans.map((plan: any) => ({
      ...plan,
      features: plan.features || []
    }));

    return NextResponse.json({
      plans: parsedPlans
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST: Create new plan
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, price, lead_credits, features, is_active } = body;

    // Validate required fields
    if (!name || price === undefined || lead_credits === undefined) {
      return NextResponse.json(
        { error: 'Name, price, and lead credits are required' },
        { status: 400 }
      );
    }

    // Get max sort order
    const maxOrder = await sql`
      SELECT MAX(sort_order) as max_order FROM subscription_plans
    `;
    const nextOrder = (maxOrder[0]?.max_order || 0) + 1;

    // Insert new plan
    const result = await sql`
      INSERT INTO subscription_plans (
        name, description, price, lead_credits,
        features, is_active, sort_order
      ) VALUES (
        ${name}, ${description}, ${price}, ${lead_credits},
        ${JSON.stringify(features)}, ${is_active}, ${nextOrder}
      ) RETURNING *
    `;

    return NextResponse.json({
      success: true,
      plan: result[0]
    });

  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}

// PUT: Update existing plan
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, description, price, lead_credits, features, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Update plan
    const result = await sql`
      UPDATE subscription_plans
      SET
        name = ${name},
        description = ${description},
        price = ${price},
        lead_credits = ${lead_credits},
        features = ${JSON.stringify(features)},
        is_active = ${is_active},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: result[0]
    });

  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}
