import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

interface BusinessRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  category: string | null;
  website: string | null;
  rating: number | null;
  reviews: number | null;
  claim_token: string | null;
  email_sent_at: string | null;
  expires_at: string | null;
}

// GET: Export unclaimed businesses as CSV
export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = await verifyToken(token.value);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const includeEmailed = searchParams.get('includeEmailed') === 'true';
    const includeClaimed = searchParams.get('includeClaimed') === 'true';
    const emailFilter = searchParams.get('emailFilter') || 'with-email';
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const businessIds = searchParams.get('businessIds')?.split(',').filter(Boolean);

    // Build query conditions
    const conditions = [];
    
    // Claimed/unclaimed filter
    if (!includeClaimed) {
      conditions.push(`b.is_claimed = false`);
    }
    
    // Email filter
    if (emailFilter === 'with-email') {
      conditions.push(`b.email IS NOT NULL`);
      conditions.push(`b.email != ''`);
    } else if (emailFilter === 'without-email') {
      conditions.push(`(b.email IS NULL OR b.email = '')`);
    }
    // 'all' means no email filter
    
    const params: any[] = [];
    let paramCount = 0;
    
    if (!includeEmailed) {
      conditions.push(`cc.email_sent_at IS NULL`);
    }
    
    if (state) {
      paramCount++;
      conditions.push(`b.state = $${paramCount}`);
      params.push(state);
    }
    
    if (city) {
      paramCount++;
      conditions.push(`b.city = $${paramCount}`);
      params.push(city);
    }
    
    if (category) {
      paramCount++;
      conditions.push(`b.category = $${paramCount}`);
      params.push(category);
    }
    
    if (businessIds && businessIds.length > 0) {
      paramCount++;
      conditions.push(`b.id = ANY($${paramCount}::uuid[])`);
      params.push(businessIds);
    }
    
    // Fetch unclaimed businesses
    const query = `
      SELECT 
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
        b.rating,
        b.reviews,
        cc.claim_token,
        cc.email_sent_at,
        cc.expires_at
      FROM businesses b
      LEFT JOIN LATERAL (
        SELECT * FROM claim_campaigns 
        WHERE business_id = b.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) cc ON true
      WHERE ${conditions.join(' AND ')}
      ORDER BY b.reviews DESC, b.rating DESC
      LIMIT 10000
    `;
    
    const businesses = await sql(query, params);

    // Note: Tokens are now auto-generated when businesses are created
    // No need to generate them on export

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Create CSV content
    const csvHeaders = [
      'Business ID',
      'Business Name',
      'Email',
      'Phone',
      'Address',
      'City',
      'State',
      'Zip',
      'Category',
      'Website',
      'Rating',
      'Reviews',
      'Claim URL',
      'Short Claim URL',
      'Email Sent',
      'Token Expires'
    ];

    const csvRows = (businesses as unknown as BusinessRow[]).map((b: BusinessRow) => {
      // All businesses should have tokens now (auto-generated)
      const shortUrl = b.claim_token ? `${baseUrl}/claim/${b.claim_token}` : '';
      const longUrl = `${baseUrl}/claim?businessId=${b.id}&businessName=${encodeURIComponent(b.name)}&email=${encodeURIComponent(b.email || '')}&phone=${encodeURIComponent(b.phone || '')}&address=${encodeURIComponent(b.address || '')}&city=${encodeURIComponent(b.city || '')}&state=${encodeURIComponent(b.state || '')}&zipcode=${encodeURIComponent(b.zipcode || '')}&category=${encodeURIComponent(b.category || '')}&website=${encodeURIComponent(b.website || '')}`;
      
      return [
        b.id,
        b.name,
        b.email || '',
        b.phone || '',
        b.address || '',
        b.city || '',
        b.state || '',
        b.zipcode || '',
        b.category || '',
        b.website || '',
        b.rating || '',
        b.reviews || '0',
        longUrl,
        shortUrl,
        b.email_sent_at ? new Date(b.email_sent_at).toISOString() : 'No',
        b.expires_at ? new Date(b.expires_at).toISOString() : ''
      ].map(field => {
        // Escape fields that contain commas or quotes
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',');
    });

    const csv = [csvHeaders.join(','), ...csvRows].join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="unclaimed-businesses-${state || city || 'all'}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting businesses:', error);
    return NextResponse.json(
      { error: 'Failed to export businesses' },
      { status: 500 }
    );
  }
}