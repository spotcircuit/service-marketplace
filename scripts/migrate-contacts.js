#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function migrateContacts() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  console.log('🚀 Connecting to Neon database...');
  const sql = neon(databaseUrl);

  try {
    // Check if contacts table already exists
    const existingTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'contacts'
      )
    `;

    if (existingTable[0].exists) {
      console.log('⚠️  Contacts table already exists');

      // Check how many contacts we have
      const contactCount = await sql`SELECT COUNT(*) as count FROM contacts`;
      console.log(`   Found ${contactCount[0].count} existing contacts`);

      if (process.argv.includes('--force')) {
        console.log('🗑️  Dropping existing contacts table (--force flag used)');
        await sql`DROP TABLE IF EXISTS contacts CASCADE`;
      } else {
        console.log('   Use --force flag to recreate the table');
        process.exit(0);
      }
    }

    console.log('📝 Reading migration SQL...');
    const migrationPath = path.join(__dirname, '..', 'database', 'add-contacts-table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`🔄 Executing ${statements.length} migration statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await sql(statement + ';');
          console.log(`   ✅ Statement ${i + 1}/${statements.length} executed`);
        } catch (err) {
          console.error(`   ❌ Failed statement ${i + 1}:`, err.message);
          console.error(`   Statement was: ${statement.substring(0, 100)}...`);
        }
      }
    }

    // Verify the migration
    console.log('\n🔍 Verifying migration...');

    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'contacts'
      ORDER BY ordinal_position
    `;

    console.log(`   ✅ Contacts table created with ${columns.length} columns`);

    // Check migrated data
    const contactStats = await sql`
      SELECT
        COUNT(*) as total_contacts,
        COUNT(DISTINCT business_id) as businesses_with_contacts,
        SUM(CASE WHEN is_primary THEN 1 ELSE 0 END) as primary_contacts
      FROM contacts
    `;

    console.log('\n📊 Contact Migration Stats:');
    console.log(`   Total contacts: ${contactStats[0].total_contacts}`);
    console.log(`   Businesses with contacts: ${contactStats[0].businesses_with_contacts}`);
    console.log(`   Primary contacts: ${contactStats[0].primary_contacts}`);

    // Show sample contacts
    const sampleContacts = await sql`
      SELECT
        b.name as business_name,
        c.name as contact_name,
        c.title,
        c.phone,
        c.phone_type,
        c.email,
        c.is_primary
      FROM contacts c
      JOIN businesses b ON b.id = c.business_id
      WHERE c.is_primary = true
      LIMIT 5
    `;

    if (sampleContacts.length > 0) {
      console.log('\n📋 Sample Primary Contacts:');
      sampleContacts.forEach((contact, i) => {
        console.log(`   ${i + 1}. ${contact.business_name}`);
        console.log(`      Contact: ${contact.contact_name || 'N/A'} (${contact.title || 'N/A'})`);
        console.log(`      Phone: ${contact.phone || 'N/A'} (${contact.phone_type})`);
        console.log(`      Email: ${contact.email || 'N/A'}`);
      });
    }

    console.log('\n✅ Contact migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migrateContacts();
