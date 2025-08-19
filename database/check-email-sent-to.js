#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function checkEmailSentTo() {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('📧 CHECKING EMAIL_SENT_TO DATA IN CLAIM_CAMPAIGNS\n');
  
  try {
    // Get stats
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(email_sent_to) as with_email,
        COUNT(CASE WHEN email_sent_to LIKE '%,%' THEN 1 END) as with_comma,
        COUNT(CASE WHEN email_sent_to LIKE '%;%' THEN 1 END) as with_semicolon,
        COUNT(CASE WHEN email_sent_to LIKE '[%]%' THEN 1 END) as json_array,
        COUNT(CASE WHEN email_sent_to LIKE '%@%' AND email_sent_to LIKE '%,%@%' THEN 1 END) as multiple_emails
      FROM claim_campaigns
    `;
    
    console.log('📊 Stats:');
    console.log(`  Total campaigns: ${stats[0].total}`);
    console.log(`  With email_sent_to: ${stats[0].with_email}`);
    console.log(`  With comma-separated: ${stats[0].with_comma}`);
    console.log(`  With semicolon-separated: ${stats[0].with_semicolon}`);
    console.log(`  JSON arrays: ${stats[0].json_array}`);
    console.log(`  Multiple emails: ${stats[0].multiple_emails}`);
    
    // Get samples
    const samples = await sql`
      SELECT id, business_id, email_sent_to
      FROM claim_campaigns
      WHERE email_sent_to IS NOT NULL 
      AND email_sent_to != ''
      LIMIT 20
    `;
    
    console.log('\n📋 Sample email_sent_to values:');
    samples.forEach((s, i) => {
      console.log(`${i+1}. ${s.email_sent_to}`);
      
      // Check for patterns
      if (s.email_sent_to.startsWith('[')) {
        console.log(`   ⚠️ JSON array detected`);
        try {
          const parsed = JSON.parse(s.email_sent_to);
          console.log(`   Parsed: ${parsed.length} emails`);
          parsed.forEach(email => console.log(`     - ${email}`));
        } catch (e) {
          console.log(`   Failed to parse`);
        }
      } else if (s.email_sent_to.includes(',')) {
        console.log(`   ⚠️ Comma-separated emails detected`);
        const emails = s.email_sent_to.split(',').map(e => e.trim());
        emails.forEach(email => console.log(`     - ${email}`));
      }
    });
    
    // Check businesses table for comparison
    const businessEmails = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(email) as with_email,
        COUNT(CASE WHEN email LIKE '[%]%' THEN 1 END) as json_array
      FROM businesses
    `;
    
    console.log('\n📊 Businesses table for comparison:');
    console.log(`  Total businesses: ${businessEmails[0].total}`);
    console.log(`  With email: ${businessEmails[0].with_email}`);
    console.log(`  JSON arrays in email: ${businessEmails[0].json_array}`);
    
    // Show businesses with array emails
    if (businessEmails[0].json_array > 0) {
      const businessArrays = await sql`
        SELECT id, name, email
        FROM businesses
        WHERE email LIKE '[%]%'
        LIMIT 5
      `;
      
      console.log('\n📋 Businesses with array emails:');
      businessArrays.forEach(b => {
        console.log(`\n  ${b.name}`);
        console.log(`  Raw: ${b.email}`);
        try {
          const parsed = JSON.parse(b.email);
          console.log(`  Parsed: ${parsed.length} emails`);
          parsed.forEach(email => console.log(`    - ${email}`));
        } catch (e) {
          console.log(`  Failed to parse`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkEmailSentTo().catch(console.error);