#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkCampaignEmails() {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('📧 CHECKING CLAIM_CAMPAIGNS EMAIL DATA\n');
  
  try {
    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'claim_campaigns'
      ORDER BY ordinal_position
    `;
    
    console.log('Table columns:');
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });
    
    // Check sample data
    const samples = await sql`
      SELECT id, business_id, contact_email, email_sent_at
      FROM claim_campaigns
      WHERE contact_email IS NOT NULL
      LIMIT 10
    `;
    
    console.log('\n📋 Sample campaign emails:');
    if (samples.length === 0) {
      console.log('  No campaigns with contact_email found');
    } else {
      samples.forEach(s => {
        console.log(`  Campaign ${s.id.substring(0,8)}...`);
        console.log(`    contact_email: ${s.contact_email}`);
        console.log(`    Type: ${typeof s.contact_email}`);
        // Check if it looks like an array stored as string
        if (s.contact_email && s.contact_email.startsWith('[')) {
          console.log(`    ⚠️ Looks like JSON array!`);
        }
      });
    }
    
    // Check for array-like data
    const arrayLike = await sql`
      SELECT COUNT(*) as count
      FROM claim_campaigns
      WHERE contact_email LIKE '[%' OR contact_email LIKE '{%'
    `;
    
    console.log(`\n📊 Stats:`);
    console.log(`  Campaigns with array-like contact_email: ${arrayLike[0].count}`);
    
    // Get total stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(contact_email) as with_email,
        COUNT(CASE WHEN contact_email LIKE '%,%' THEN 1 END) as with_comma,
        COUNT(CASE WHEN contact_email LIKE '%;%' THEN 1 END) as with_semicolon,
        COUNT(CASE WHEN contact_email LIKE '[%' THEN 1 END) as json_array
      FROM claim_campaigns
    `;
    
    console.log(`  Total campaigns: ${stats[0].total}`);
    console.log(`  With contact_email: ${stats[0].with_email}`);
    console.log(`  With comma-separated: ${stats[0].with_comma}`);
    console.log(`  With semicolon-separated: ${stats[0].with_semicolon}`);
    console.log(`  JSON arrays: ${stats[0].json_array}`);
    
    // Show examples if found
    if (stats[0].json_array > 0) {
      const examples = await sql`
        SELECT id, business_id, contact_email
        FROM claim_campaigns
        WHERE contact_email LIKE '[%'
        LIMIT 5
      `;
      
      console.log('\n📋 Examples of array data:');
      examples.forEach(ex => {
        console.log(`\n  Campaign: ${ex.id.substring(0,8)}...`);
        console.log(`  Raw data: ${ex.contact_email}`);
        try {
          const parsed = JSON.parse(ex.contact_email);
          console.log(`  Parsed:`, parsed);
        } catch (e) {
          console.log(`  Failed to parse as JSON`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCampaignEmails().catch(console.error);