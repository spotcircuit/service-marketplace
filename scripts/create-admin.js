#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

(async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not found in .env.local');
      process.exit(1);
    }

    const email = process.env.ADMIN_EMAIL || process.argv[2];
    const password = process.env.ADMIN_PASSWORD || process.argv[3];
    const name = process.env.ADMIN_NAME || process.argv[4] || null;

    if (!email) {
      console.error('❌ Missing ADMIN_EMAIL (or argv[2])');
      process.exit(1);
    }

    const sql = neon(databaseUrl);

    // Check if the user exists
    const existing = await sql`SELECT id, role FROM users WHERE email = ${email}`;

    if (existing.length > 0) {
      // Update to admin and optionally set password/name
      let passwordHash = null;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(password, salt);
      }

      await sql`
        UPDATE users
        SET role = 'admin',
            email_verified = true,
            email_verified_at = NOW(),
            ${passwordHash ? sql`password_hash = ${passwordHash},` : sql``}
            ${name ? sql`name = ${name},` : sql``}
            updated_at = NOW()
        WHERE email = ${email}
      `;
      console.log(`✅ Promoted to admin: ${email}${password ? ' (password updated)' : ''}`);
    } else {
      if (!password) {
        console.error('❌ User does not exist. Provide ADMIN_PASSWORD (or argv[3]) to create.');
        process.exit(1);
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      await sql`
        INSERT INTO users (email, password_hash, name, role, email_verified, email_verified_at)
        VALUES (${email}, ${passwordHash}, ${name}, 'admin', true, NOW())
        ON CONFLICT (email) DO UPDATE
        SET role = 'admin', email_verified = true, email_verified_at = NOW()
      `;
      console.log(`✅ Admin user created: ${email}`);
    }

    console.log('\nℹ️  Please change this password after first login.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
})();
