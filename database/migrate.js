#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('Error: DATABASE_URL environment variable is not set');
    console.error('Please ensure your .env.local file contains DATABASE_URL');
    process.exit(1);
  }

  const sql = neon(dbUrl);
  
  try {
    console.log('Running database migration...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await sql(schema);
    
    console.log('✅ Database migration completed successfully!');
    console.log('The quotes table has been created.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === '42P07') {
      console.log('Note: Some tables already exist, which is normal.');
    } else {
      process.exit(1);
    }
  }
}

migrate();