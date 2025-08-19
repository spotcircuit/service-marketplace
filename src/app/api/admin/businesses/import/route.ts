import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    // Get CSV file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read CSV content
    const csvContent = await file.text();
    
    // Parse CSV manually (simple parser for our format)
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Get existing businesses for duplicate checking
    const existing = await sql`
      SELECT name, phone, city, state 
      FROM businesses
    `;
    
    const existingKeys = new Set(
      existing.map((b: any) => `${b.name?.toLowerCase()}_${b.city}_${b.state}`)
    );

    let imported = 0;
    let skipped = 0;
    let errors = 0;
    const errorMessages: string[] = [];

    // Process each row (skip header)
    for (let i = 1; i < lines.length; i++) {
      try {
        // Parse CSV row (handle quoted fields)
        const row = parseCSVRow(lines[i]);
        const record: any = {};
        
        headers.forEach((header, index) => {
          record[header] = row[index] || '';
        });

        // Check for required fields
        if (!record.name) {
          errors++;
          errorMessages.push(`Row ${i + 1}: Missing business name`);
          continue;
        }

        // Check for duplicates
        const key = `${record.name?.toLowerCase()}_${record.city}_${record.state}`;
        if (existingKeys.has(key)) {
          skipped++;
          continue;
        }

        // Parse numeric fields
        const rating = record.rating ? parseFloat(record.rating) : null;
        const reviews = record.reviews ? parseInt(record.reviews) : 0;
        const latitude = record.latitude ? parseFloat(record.latitude) : null;
        const longitude = record.longitude ? parseFloat(record.longitude) : null;

        // Insert business
        const business = await sql`
          INSERT INTO businesses (
            name, phone, email, website, address, city, state, zipcode,
            category, rating, reviews, latitude, longitude,
            hours, services, description, logo_url, gallery_urls,
            is_claimed, is_verified, created_at, updated_at
          ) VALUES (
            ${record.name},
            ${record.phone || null},
            ${record.email ? record.email.split(';')[0].trim() : null},
            ${record.website || null},
            ${record.address || null},
            ${record.city || null},
            ${record.state || null},
            ${record.zipcode || null},
            ${record.category || 'Dumpster Rental'},
            ${rating},
            ${reviews},
            ${latitude},
            ${longitude},
            ${record.hours || null},
            ${record.services || null},
            ${record.description || null},
            ${record.logo_url || null},
            ${record.gallery_urls || null},
            false,
            false,
            NOW(),
            NOW()
          )
          RETURNING id
        `;

        // If there are multiple emails, create claim campaign with contacts
        if (record.email && record.email.includes(';')) {
          const emails = record.email.split(';').map((e: string) => e.trim()).filter((e: string) => e && e.includes('@'));
          
          // Generate claim token
          const tokenResult = await sql`
            SELECT MD5(gen_random_uuid()::text || NOW()::text) as token
          `;
          const claimToken = tokenResult[0].token.substring(0, 8);
          
          // Create claim campaign
          const campaign = await sql`
            INSERT INTO claim_campaigns (
              business_id,
              claim_token,
              expires_at,
              created_at
            ) VALUES (
              ${business[0].id},
              ${claimToken},
              NOW() + INTERVAL '30 days',
              NOW()
            )
            RETURNING id
          `;
          
          // Add all emails as contacts
          for (let j = 0; j < emails.length; j++) {
            await sql`
              INSERT INTO claim_contacts (
                claim_campaign_id,
                email,
                is_primary,
                is_selected,
                created_at
              ) VALUES (
                ${campaign[0].id},
                ${emails[j]},
                ${j === 0},
                true,
                NOW()
              )
              ON CONFLICT (claim_campaign_id, email) DO NOTHING
            `;
          }
        }

        imported++;
        existingKeys.add(key);

      } catch (error: any) {
        errors++;
        errorMessages.push(`Row ${i + 1}: ${error.message}`);
        if (errorMessages.length >= 10) {
          errorMessages.push('... and more errors');
          break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors,
      errorMessages: errorMessages.slice(0, 10),
      message: `Imported ${imported} businesses, skipped ${skipped} duplicates, ${errors} errors`
    });

  } catch (error: any) {
    console.error('Error importing businesses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import businesses' },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV row with proper quote handling
function parseCSVRow(row: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current);
  
  return result.map(field => field.trim());
}