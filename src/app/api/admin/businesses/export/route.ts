import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

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

    // Fetch all businesses with their contact emails
    const businesses = await sql`
      SELECT 
        b.*,
        STRING_AGG(DISTINCT con.email, '; ' ORDER BY con.email) as contact_emails
      FROM businesses b
      LEFT JOIN claim_campaigns cc ON b.id = cc.business_id
      LEFT JOIN claim_contacts con ON cc.id = con.claim_campaign_id
      GROUP BY b.id
      ORDER BY b.state, b.city, b.name
    `;

    // CSV columns
    const headers = [
      'name',
      'phone',
      'email',
      'website',
      'address',
      'city',
      'state',
      'zipcode',
      'category',
      'rating',
      'reviews',
      'latitude',
      'longitude',
      'hours',
      'services',
      'description',
      'logo_url',
      'gallery_urls'
    ];

    // Create CSV rows
    const csvRows = [headers.join(',')];
    
    businesses.forEach((business: any) => {
      // Combine business email with contact emails
      let allEmails: string[] = [];
      if (business.email) allEmails.push(business.email);
      if (business.contact_emails) {
        allEmails = allEmails.concat(business.contact_emails.split('; '));
      }
      // Remove duplicates
      allEmails = [...new Set(allEmails)];
      
      const row = [
        business.name || '',
        business.phone || '',
        allEmails.join('; '),
        business.website || '',
        business.address || '',
        business.city || '',
        business.state || '',
        business.zipcode || '',
        business.category || 'Dumpster Rental',
        business.rating || '',
        business.reviews || '0',
        business.latitude || '',
        business.longitude || '',
        business.hours || '',
        business.services || '',
        business.description || '',
        business.logo_url || '',
        business.gallery_urls ? (Array.isArray(business.gallery_urls) ? business.gallery_urls.join('; ') : business.gallery_urls) : ''
      ].map(field => {
        // Escape fields that contain commas, quotes, or newlines
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      });
      
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="businesses-${new Date().toISOString().split('T')[0]}.csv"`
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