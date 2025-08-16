#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function setupAdmin() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  console.log('🚀 Setting up admin user...');
  const sql = neon(databaseUrl);

  try {
    const email = 'brian@spotcircuit.com';
    const password = 'Admin123!'; // You should change this!
    const name = 'Brian';

    // Check if admin already exists
    const existing = await sql`
      SELECT id, role FROM users WHERE email = ${email}
    `;

    if (existing.length > 0) {
      // Update to admin role if not already
      await sql`
        UPDATE users
        SET role = 'admin', email_verified = true
        WHERE email = ${email}
      `;
      console.log('✅ Admin user updated:', email);
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create admin user
      await sql`
        INSERT INTO users (email, password_hash, name, role, email_verified)
        VALUES (${email}, ${passwordHash}, ${name}, 'admin', true)
      `;
      console.log('✅ Admin user created:', email);
    }

    console.log('\n📝 Admin credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   (Please change the password after first login)');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }

  process.exit(0);
}

setupAdmin();
