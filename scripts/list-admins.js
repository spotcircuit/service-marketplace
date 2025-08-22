#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

(async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not found in .env.local');
      process.exit(1);
    }

    const sql = neon(databaseUrl);

    // Query all admin users
    const admins = await sql`
      SELECT 
        id,
        email,
        name,
        role,
        phone,
        email_verified,
        email_verified_at,
        last_login_at,
        created_at,
        updated_at
      FROM users 
      WHERE role = 'admin'
      ORDER BY created_at ASC
    `;

    if (admins.length === 0) {
      console.log('No admin users found in the database.');
    } else {
      console.log(`\nFound ${admins.length} admin user(s):\n`);
      console.log('─'.repeat(80));
      
      admins.forEach((admin, index) => {
        console.log(`Admin #${index + 1}`);
        console.log(`  ID:              ${admin.id}`);
        console.log(`  Email:           ${admin.email}`);
        console.log(`  Name:            ${admin.name || '(not set)'}`);
        console.log(`  Phone:           ${admin.phone || '(not set)'}`);
        console.log(`  Email Verified:  ${admin.email_verified ? 'Yes' : 'No'}`);
        console.log(`  Verified At:     ${admin.email_verified_at ? new Date(admin.email_verified_at).toLocaleString() : 'N/A'}`);
        console.log(`  Last Login:      ${admin.last_login_at ? new Date(admin.last_login_at).toLocaleString() : 'Never'}`);
        console.log(`  Created:         ${new Date(admin.created_at).toLocaleString()}`);
        console.log(`  Updated:         ${new Date(admin.updated_at).toLocaleString()}`);
        console.log('─'.repeat(80));
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error querying admins:', err);
    process.exit(1);
  }
})();