import { NextResponse } from 'next/server';
import { getNicheConfig } from '@/lib/niche-config';

export async function GET() {
  try {
    const config = getNicheConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching niche config:', error);
    return NextResponse.json(
      { error: 'Failed to load niche configuration' },
      { status: 500 }
    );
  }
}