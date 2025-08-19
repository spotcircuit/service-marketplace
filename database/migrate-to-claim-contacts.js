#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function migrateToClaimContacts() {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('🔄 MIGRATING TO CLAIM_CONTACTS STRUCTURE\n');
  
  try {
    // Step 1: Create the new table structure
    console.log('1️⃣ Creating claim_contacts table...');
    const createTableSQL = fs.readFileSync('database/create-claim-contacts.sql', 'utf8');
    const statements = createTableSQL.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql(statement);
      }
    }
    console.log('   ✅ Table created\n');
    
    // Step 2: Get all campaigns with email_sent_to data
    console.log('2️⃣ Fetching existing email data...');
    const campaigns = await sql`
      SELECT id, email_sent_to, email_sent_at, email_bounced_at, email_opened_at, link_clicked_at
      FROM claim_campaigns
      WHERE email_sent_to IS NOT NULL AND email_sent_to != ''
    `;
    console.log(`   Found ${campaigns.length} campaigns with email data\n`);
    
    // Step 3: Parse and migrate emails
    console.log('3️⃣ Parsing and migrating emails...');
    let totalEmails = 0;
    let multipleEmails = 0;
    let errors = 0;
    
    for (const campaign of campaigns) {
      try {
        let emails = [];
        const rawEmail = campaign.email_sent_to;
        
        // Parse different formats
        if (rawEmail.startsWith('[') && rawEmail.endsWith(']')) {
          // JSON array format
          try {
            emails = JSON.parse(rawEmail);
          } catch (e) {
            // Not valid JSON, treat as string
            emails = [rawEmail];
          }
        } else if (rawEmail.includes(';')) {
          // Semicolon separated
          emails = rawEmail.split(';').map(e => e.trim()).filter(e => e);
        } else if (rawEmail.includes(',') && rawEmail.includes('@')) {
          // Comma separated (but make sure it's not part of a name)
          const parts = rawEmail.split(',');
          // Check if all parts look like emails
          if (parts.every(p => p.includes('@') || p.trim() === '')) {
            emails = parts.map(e => e.trim()).filter(e => e && e.includes('@'));
          } else {
            emails = [rawEmail];
          }
        } else {
          // Single email
          emails = [rawEmail];
        }
        
        // Clean up emails
        emails = emails.map(email => {
          // Remove common junk
          email = email.trim();
          email = email.replace(/^["']|["']$/g, ''); // Remove quotes
          email = email.replace(/\s+/g, ' '); // Normalize spaces
          
          // Remove duplicated text (like "895-7722info@thronerooms.com")
          // Look for pattern where email is concatenated with other text
          const match = email.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (match) {
            email = match[1];
          }
          
          return email.toLowerCase();
        }).filter(email => {
          // Validate email format
          return email && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
        });
        
        // Remove duplicates
        emails = [...new Set(emails)];
        
        if (emails.length > 1) {
          multipleEmails++;
        }
        
        // Insert into claim_contacts
        for (let i = 0; i < emails.length; i++) {
          await sql`
            INSERT INTO claim_contacts (
              claim_campaign_id,
              email,
              is_primary,
              is_selected,
              email_sent_at,
              email_bounced_at,
              email_opened_at,
              link_clicked_at
            ) VALUES (
              ${campaign.id},
              ${emails[i]},
              ${i === 0}, -- First email is primary
              true, -- All selected by default
              ${campaign.email_sent_at},
              ${campaign.email_bounced_at},
              ${campaign.email_opened_at},
              ${campaign.link_clicked_at}
            )
            ON CONFLICT (claim_campaign_id, email) DO NOTHING
          `;
          totalEmails++;
        }
        
      } catch (error) {
        errors++;
        console.log(`   Error processing campaign ${campaign.id}: ${error.message}`);
      }
    }
    
    console.log(`   ✅ Migrated ${totalEmails} emails`);
    console.log(`   📊 ${multipleEmails} campaigns have multiple emails\n`);
    
    // Step 4: Analyze results
    console.log('4️⃣ Analyzing migration results...');
    const stats = await sql`
      SELECT 
        COUNT(DISTINCT claim_campaign_id) as campaigns_with_contacts,
        COUNT(*) as total_contacts,
        COUNT(DISTINCT email) as unique_emails,
        AVG(email_count)::numeric(10,2) as avg_emails_per_campaign
      FROM (
        SELECT claim_campaign_id, COUNT(*) as email_count
        FROM claim_contacts
        GROUP BY claim_campaign_id
      ) t
    `;
    
    console.log('   📊 Migration Stats:');
    console.log(`      Campaigns with contacts: ${stats[0].campaigns_with_contacts}`);
    console.log(`      Total contacts: ${stats[0].total_contacts}`);
    console.log(`      Unique emails: ${stats[0].unique_emails}`);
    console.log(`      Avg emails per campaign: ${stats[0].avg_emails_per_campaign}\n`);
    
    // Show examples of campaigns with multiple emails
    const multipleExamples = await sql`
      SELECT 
        cc.id,
        b.name as business_name,
        COUNT(con.id) as email_count,
        STRING_AGG(con.email, ', ' ORDER BY con.is_primary DESC, con.email) as emails
      FROM claim_campaigns cc
      JOIN businesses b ON cc.business_id = b.id
      JOIN claim_contacts con ON cc.id = con.claim_campaign_id
      GROUP BY cc.id, b.name
      HAVING COUNT(con.id) > 1
      ORDER BY COUNT(con.id) DESC
      LIMIT 5
    `;
    
    if (multipleExamples.length > 0) {
      console.log('   📧 Examples of campaigns with multiple emails:');
      multipleExamples.forEach(ex => {
        console.log(`      ${ex.business_name}: ${ex.email_count} emails`);
        console.log(`        ${ex.emails}\n`);
      });
    }
    
    console.log('✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
  }
}

migrateToClaimContacts().catch(console.error);