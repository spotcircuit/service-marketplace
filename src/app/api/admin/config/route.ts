import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { sql } from '@/lib/neon';

// GET: Load configurations from database
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all configurations
    const configs = await sql`
      SELECT key, value, category, description
      FROM site_configurations
      ORDER BY category, key
    `;

    // Transform into a more usable format
    const configObject: any = {};
    configs.forEach((config: any) => {
      if (!configObject[config.category]) {
        configObject[config.category] = {};
      }
      configObject[config.category][config.key] = config.value;
    });

    return NextResponse.json({
      success: true,
      config: configObject,
      raw: configs
    });
  } catch (error) {
    console.error('Error loading config:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}

// POST: Save configurations to database
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { key, value, category, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Upsert configuration
    await sql`
      INSERT INTO site_configurations (key, value, category, description, updated_by)
      VALUES (${key}, ${JSON.stringify(value)}, ${category || 'general'}, ${description || null}, ${user!.id})
      ON CONFLICT (key)
      DO UPDATE SET
        value = ${JSON.stringify(value)},
        category = ${category || 'general'},
        description = ${description || null},
        updated_by = ${user!.id},
        updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}

// PUT: Batch update configurations
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser();
    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { configs } = body;

    if (!configs || !Array.isArray(configs)) {
      return NextResponse.json(
        { error: 'Configs array is required' },
        { status: 400 }
      );
    }

    // Update each configuration
    for (const config of configs) {
      if (config.key && config.value !== undefined) {
        await sql`
          INSERT INTO site_configurations (key, value, category, description, updated_by)
          VALUES (
            ${config.key},
            ${JSON.stringify(config.value)},
            ${config.category || 'general'},
            ${config.description || null},
            ${user!.id}
          )
          ON CONFLICT (key)
          DO UPDATE SET
            value = ${JSON.stringify(config.value)},
            category = ${config.category || 'general'},
            description = ${config.description || null},
            updated_by = ${user!.id},
            updated_at = NOW()
        `;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${configs.length} configurations saved successfully`
    });
  } catch (error) {
    console.error('Error batch saving config:', error);
    return NextResponse.json(
      { error: 'Failed to save configurations' },
      { status: 500 }
    );
  }
}
