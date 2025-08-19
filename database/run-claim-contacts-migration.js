#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL);
  
  console.log('🔄 CREATING CLAIM_CONTACTS STRUCTURE\n');
  
  try {
    // Step 1: Create table
    console.log('1️⃣ Creating claim_contacts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS claim_contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        claim_campaign_id UUID NOT NULL REFERENCES claim_campaigns(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        is_selected BOOLEAN DEFAULT true,
        email_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        email_sent_at TIMESTAMP,
        email_bounced_at TIMESTAMP,
        email_opened_at TIMESTAMP,
        link_clicked_at TIMESTAMP,
        UNIQUE(claim_campaign_id, email)
      )
    `;
    console.log('   ✅ Table created\n');
    
    // Step 2: Create indexes
    console.log('2️⃣ Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_claim_contacts_campaign ON claim_contacts(claim_campaign_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_claim_contacts_email ON claim_contacts(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_claim_contacts_selected ON claim_contacts(claim_campaign_id, is_selected)`;
    console.log('   ✅ Indexes created\n');
    
    // Step 3: Get existing email data
    console.log('3️⃣ Migrating existing email data...');
    const campaigns = await sql`
      SELECT id, email_sent_to, email_sent_at, email_bounced_at, email_opened_at, link_clicked_at
      FROM claim_campaigns
      WHERE email_sent_to IS NOT NULL AND email_sent_to != ''
    `;
    console.log(`   Found ${campaigns.length} campaigns with email data`);
    
    let totalEmails = 0;
    let multipleEmails = 0;
    
    for (const campaign of campaigns) {
      try {
        let emails = [];
        const rawEmail = campaign.email_sent_to;
        
        // Parse semicolon-separated emails
        if (rawEmail.includes(';')) {
          emails = rawEmail.split(';').map(e => e.trim()).filter(e => e);
        } else {
          emails = [rawEmail];
        }
        
        // Clean up emails
        emails = emails.map(email => {
          email = email.trim();
          // Remove common issues
          email = email.replace(/^["']|["']$/g, ''); // Remove quotes
          email = email.replace(/\s+/g, ' '); // Normalize spaces
          
          // Extract just the email if there's other text
          const match = email.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (match) {
            email = match[1];
          }
          
          return email.toLowerCase();
        }).filter(email => {
          // Basic email validation
          return email && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
        });
        
        // Remove duplicates
        emails = [...new Set(emails)];
        
        if (emails.length > 1) {
          multipleEmails++;
        }
        
        // Insert emails
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
              ${i === 0},
              true,
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
        console.log(`   Error processing campaign: ${error.message}`);
      }
    }
    
    console.log(`   ✅ Migrated ${totalEmails} emails`);
    console.log(`   📊 ${multipleEmails} campaigns have multiple emails\n`);
    
    // Step 4: Show results
    console.log('4️⃣ Migration results:');
    const stats = await sql`
      SELECT 
        COUNT(DISTINCT claim_campaign_id) as campaigns_with_contacts,
        COUNT(*) as total_contacts,
        COUNT(DISTINCT email) as unique_emails
      FROM claim_contacts
    `;
    
    console.log(`   Campaigns with contacts: ${stats[0].campaigns_with_contacts}`);
    console.log(`   Total contacts: ${stats[0].total_contacts}`);
    console.log(`   Unique emails: ${stats[0].unique_emails}\n`);
    
    // Show examples with multiple emails
    const examples = await sql`
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
    
    if (examples.length > 0) {
      console.log('📧 Examples with multiple emails:');
      examples.forEach(ex => {
        console.log(`   ${ex.business_name}: ${ex.email_count} emails`);
        console.log(`     ${ex.emails}\n`);
      });
    }
    
    console.log('✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runMigration().catch(console.error);