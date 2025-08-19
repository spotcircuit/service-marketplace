#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  try {
    console.log('🚀 Querying phone-related configuration rows...');
    const rows = await sql`
      SELECT key, value, category, updated_at
      FROM site_configurations
      WHERE key IN (
        'contact_phone',
        'contact_phone_display',
        'contact_phone_e164',
        'support_hours'
      )
      ORDER BY key
    `;

    console.log(`Found ${rows?.length || 0} rows.`);
    if (!rows || rows.length === 0) {
      console.log('No phone-related config rows found.');
      process.exit(0);
    }

    console.log('Phone-related configuration rows:');
    for (const r of rows) {
      console.log(`- ${r.key}: ${r.value}`);
    }
  } catch (err) {
    console.error('Error querying configuration:', err);
    process.exit(1);
  }
})();
