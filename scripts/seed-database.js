#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function seedDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  console.log('🚀 Connecting to Neon database...');
  const sql = neon(databaseUrl);

  try {
    // Check if tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('businesses', 'leads')
    `;

    console.log(`📊 Found ${tables.length} tables`);

    // Check if data already exists
    const existingBusinesses = await sql`SELECT COUNT(*) as count FROM businesses`;
    if (existingBusinesses[0].count > 0) {
      console.log(`⚠️  Database already contains ${existingBusinesses[0].count} businesses`);
      const answer = process.argv[2];
      if (answer !== '--force') {
        console.log('Use --force flag to overwrite existing data');
        process.exit(0);
      }
      console.log('🗑️  Clearing existing data...');
      await sql`TRUNCATE businesses, leads RESTART IDENTITY CASCADE`;
    }

    // Read and execute seed file
    console.log('📝 Reading seed file...');
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    const seedContent = fs.readFileSync(seedPath, 'utf8');

    // Execute the entire seed file as one statement
    // (it's a single large INSERT with multiple VALUES)
    console.log('🔄 Executing seed SQL...');

    try {
      // Remove comments and execute
      const cleanedSql = seedContent
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();

      if (cleanedSql) {
        await sql(cleanedSql);
        console.log('✅ Seed SQL executed successfully');
      }
    } catch (err) {
      console.error('❌ Failed to execute seed SQL:', err.message);
    }

    // Verify the seed
    const businessCount = await sql`SELECT COUNT(*) as count FROM businesses`;
    const leadCount = await sql`SELECT COUNT(*) as count FROM leads`;

    console.log('\n✅ Database seeded successfully!');
    console.log(`   - ${businessCount[0].count} businesses`);
    console.log(`   - ${leadCount[0].count} leads`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedDatabase();
