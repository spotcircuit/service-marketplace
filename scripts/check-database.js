#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  console.log('🚀 Connecting to Neon database...');
  const sql = neon(databaseUrl);

  try {
    // Check existing tables
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log('\n📊 Existing tables:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));

    // Check if leads table exists
    const hasLeadsTable = tables.some(t => t.table_name === 'leads');

    if (!hasLeadsTable) {
      console.log('\n⚠️  Leads table is missing. Creating it now...');

      // Create leads table
      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          zipcode VARCHAR(10),
          service_type VARCHAR(100) NOT NULL,
          project_description TEXT,
          timeline VARCHAR(50),
          budget VARCHAR(50),
          business_ids JSONB,
          category VARCHAR(100),
          status VARCHAR(20) DEFAULT 'new',
          source VARCHAR(50) DEFAULT 'website',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        )
      `;

      // Create indexes
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_business_ids ON leads USING GIN(business_ids)`;

      console.log('✅ Leads table created successfully');
    }

    // Check if businesses table has all columns
    const businessColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'businesses'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 Businesses table columns:');
    console.log(`   Found ${businessColumns.length} columns`);

    // Check for update trigger function
    const hasTriggerFunction = await sql`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name = 'update_updated_at_column'
    `;

    if (hasTriggerFunction.length === 0) {
      console.log('\n⚠️  Creating update_updated_at_column function...');
      await sql`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = TIMEZONE('utc'::text, NOW());
          RETURN NEW;
        END;
        $$ language 'plpgsql'
      `;
      console.log('✅ Function created');
    }

    // Create triggers if they don't exist
    console.log('\n🔧 Ensuring triggers exist...');
    await sql`
      DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses
    `;
    await sql`
      CREATE TRIGGER update_businesses_updated_at
      BEFORE UPDATE ON businesses
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;

    await sql`
      DROP TRIGGER IF EXISTS update_leads_updated_at ON leads
    `;
    await sql`
      CREATE TRIGGER update_leads_updated_at
      BEFORE UPDATE ON leads
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `;

    console.log('✅ Triggers created/updated');

    // Final check
    const finalTables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('businesses', 'leads')
    `;

    console.log('\n✅ Database structure is ready!');
    console.log(`   - businesses table: ${finalTables.some(t => t.table_name === 'businesses') ? '✓' : '✗'}`);
    console.log(`   - leads table: ${finalTables.some(t => t.table_name === 'leads') ? '✓' : '✗'}`);

  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }

  process.exit(0);
}

checkDatabase();
