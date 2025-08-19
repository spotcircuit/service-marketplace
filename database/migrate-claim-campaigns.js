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
    console.log('Running claim campaigns migration...\n');
    
    // Create base tables
    console.log('Creating claim_campaigns table...');
    await sql`
      CREATE TABLE IF NOT EXISTS claim_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        claim_token VARCHAR(100) UNIQUE NOT NULL,
        email_sent_to VARCHAR(255),
        email_sent_at TIMESTAMP,
        email_opened_at TIMESTAMP,
        link_clicked_at TIMESTAMP,
        claimed_at TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        campaign_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`;
    console.log('✓ claim_campaigns table created');
    
    // Create indexes
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_claim_campaigns_token ON claim_campaigns(claim_token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_claim_campaigns_business_id ON claim_campaigns(business_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_claim_campaigns_expires_at ON claim_campaigns(expires_at)`;
    console.log('✓ Indexes created');
    
    // Create token generation function
    console.log('Creating generate_claim_token function...');
    await sql`
      CREATE OR REPLACE FUNCTION generate_claim_token()
      RETURNS VARCHAR(100) AS $$
      DECLARE
        new_token VARCHAR(100);
        done BOOLEAN DEFAULT FALSE;
      BEGIN
        WHILE NOT done LOOP
          -- Generate a random token (8 characters alphanumeric)
          new_token := LOWER(
            SUBSTRING(
              REPLACE(
                REPLACE(
                  ENCODE(gen_random_bytes(6), 'base64'),
                  '/', ''
                ),
                '+', ''
              ),
              1, 8
            )
          );
          
          -- Check if token already exists
          IF NOT EXISTS (SELECT 1 FROM claim_campaigns WHERE claim_token = new_token) THEN
            done := TRUE;
          END IF;
        END LOOP;
        
        RETURN new_token;
      END;
      $$ LANGUAGE plpgsql`;
    console.log('✓ Token generation function created');
    
    // Add extended columns
    console.log('Adding extended tracking columns...');
    await sql`ALTER TABLE claim_campaigns ADD COLUMN IF NOT EXISTS email_bounced_at TIMESTAMP`;
    await sql`ALTER TABLE claim_campaigns ADD COLUMN IF NOT EXISTS email_unsubscribed_at TIMESTAMP`;
    await sql`ALTER TABLE claim_campaigns ADD COLUMN IF NOT EXISTS account_created_at TIMESTAMP`;
    await sql`ALTER TABLE claim_campaigns ADD COLUMN IF NOT EXISTS claim_completed_at TIMESTAMP`;
    await sql`ALTER TABLE claim_campaigns ADD COLUMN IF NOT EXISTS claimed_by_user_id UUID REFERENCES users(id)`;
    await sql`ALTER TABLE claim_campaigns ADD COLUMN IF NOT EXISTS reachinbox_campaign_id VARCHAR(255)`;
    await sql`ALTER TABLE claim_campaigns ADD COLUMN IF NOT EXISTS reachinbox_thread_id VARCHAR(255)`;
    await sql`ALTER TABLE claim_campaigns ADD COLUMN IF NOT EXISTS tracking_data JSONB DEFAULT '{}'`;
    console.log('✓ Extended columns added');
    
    // Create views
    console.log('Creating unclaimed_businesses_view...');
    await sql`
      CREATE OR REPLACE VIEW unclaimed_businesses_view AS
      SELECT 
        b.id,
        b.name,
        b.email,
        b.phone,
        b.address,
        b.city,
        b.state,
        b.zipcode,
        b.category,
        b.website,
        b.is_claimed,
        b.rating,
        b.reviews,
        b.created_at as business_created_at,
        cc.claim_token,
        cc.email_sent_at,
        cc.email_opened_at,
        cc.link_clicked_at,
        cc.expires_at as token_expires_at
      FROM businesses b
      LEFT JOIN LATERAL (
        SELECT * FROM claim_campaigns 
        WHERE business_id = b.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) cc ON true
      WHERE b.is_claimed = false
        AND b.email IS NOT NULL
        AND b.email != ''`;
    console.log('✓ Views created');
    
    // Create analytics view
    console.log('Creating claim_campaign_analytics view...');
    await sql`
      CREATE OR REPLACE VIEW claim_campaign_analytics AS
      SELECT 
        cc.id,
        cc.business_id,
        b.name as business_name,
        b.email as business_email,
        b.city,
        b.state,
        b.category,
        b.rating,
        b.reviews,
        cc.claim_token,
        cc.campaign_name,
        cc.created_at as campaign_created,
        cc.email_sent_at,
        cc.email_opened_at,
        cc.link_clicked_at,
        cc.account_created_at,
        cc.claim_completed_at,
        cc.claimed_at,
        cc.expires_at,
        -- Calculate conversion metrics
        CASE 
          WHEN cc.email_sent_at IS NOT NULL THEN 1 
          ELSE 0 
        END as email_sent,
        CASE 
          WHEN cc.email_opened_at IS NOT NULL THEN 1 
          ELSE 0 
        END as email_opened,
        CASE 
          WHEN cc.link_clicked_at IS NOT NULL THEN 1 
          ELSE 0 
        END as link_clicked,
        CASE 
          WHEN cc.account_created_at IS NOT NULL THEN 1 
          ELSE 0 
        END as account_created,
        CASE 
          WHEN cc.claim_completed_at IS NOT NULL OR b.is_claimed = true THEN 1 
          ELSE 0 
        END as claim_completed,
        -- Time to action metrics
        EXTRACT(EPOCH FROM (cc.email_opened_at - cc.email_sent_at))/3600 as hours_to_open,
        EXTRACT(EPOCH FROM (cc.link_clicked_at - cc.email_sent_at))/3600 as hours_to_click,
        EXTRACT(EPOCH FROM (cc.account_created_at - cc.link_clicked_at))/3600 as hours_to_signup,
        EXTRACT(EPOCH FROM (cc.claim_completed_at - cc.account_created_at))/3600 as hours_to_claim
      FROM claim_campaigns cc
      JOIN businesses b ON cc.business_id = b.id`;
    console.log('✓ Analytics view created');
    
    console.log('\n✅ All claim campaigns migrations completed successfully!');
    console.log('You can now use the claim campaigns functionality.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code === '42P07') {
      console.log('Note: Table already exists, which is normal.');
    } else {
      console.error('Full error:', error);
      process.exit(1);
    }
  }
}

migrate();