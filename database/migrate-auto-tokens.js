#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
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
    console.log('Running auto token generation migration...\n');
    
    // Step 1: Create trigger function
    console.log('Creating auto_generate_claim_token function...');
    await sql`
      CREATE OR REPLACE FUNCTION auto_generate_claim_token()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Only generate token for unclaimed businesses with email
        IF NEW.is_claimed = FALSE AND NEW.email IS NOT NULL AND NEW.email != '' THEN
          -- Check if token already exists for this business
          IF NOT EXISTS (SELECT 1 FROM claim_campaigns WHERE business_id = NEW.id) THEN
            -- Generate and insert claim token
            INSERT INTO claim_campaigns (
              business_id,
              claim_token,
              email_sent_to,
              expires_at,
              campaign_name,
              created_at
            ) VALUES (
              NEW.id,
              generate_claim_token(),
              NEW.email,
              NOW() + INTERVAL '365 days',
              'Auto-Generated',
              NOW()
            );
          END IF;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql`;
    console.log('✓ Function created');
    
    // Step 2: Drop existing trigger if it exists
    console.log('Setting up trigger...');
    await sql`DROP TRIGGER IF EXISTS auto_generate_claim_token_trigger ON businesses`;
    
    // Step 3: Create trigger
    await sql`
      CREATE TRIGGER auto_generate_claim_token_trigger
      AFTER INSERT ON businesses
      FOR EACH ROW
      EXECUTE FUNCTION auto_generate_claim_token()`;
    console.log('✓ Trigger created');
    
    // Step 4: Generate tokens for existing unclaimed businesses
    console.log('Generating tokens for existing unclaimed businesses...');
    
    // First, get all businesses that need tokens
    const businessesNeedingTokens = await sql`
      SELECT b.id, b.email
      FROM businesses b
      LEFT JOIN claim_campaigns cc ON cc.business_id = b.id
      WHERE b.is_claimed = FALSE 
        AND b.email IS NOT NULL 
        AND b.email != ''
        AND cc.id IS NULL`;
    
    console.log(`Found ${businessesNeedingTokens.length} businesses needing tokens`);
    
    // Generate tokens for each business
    let generated = 0;
    for (const business of businessesNeedingTokens) {
      try {
        // Get a new token
        const tokenResult = await sql`SELECT generate_claim_token() as token`;
        const token = tokenResult[0].token;
        
        // Insert the campaign record
        await sql`
          INSERT INTO claim_campaigns (
            business_id,
            claim_token,
            email_sent_to,
            expires_at,
            campaign_name,
            created_at
          ) VALUES (
            ${business.id},
            ${token},
            ${business.email},
            NOW() + INTERVAL '365 days',
            'Retroactive Auto-Generated',
            NOW()
          )`;
        
        generated++;
        
        // Progress indicator
        if (generated % 10 === 0) {
          process.stdout.write(`\rGenerated ${generated}/${businessesNeedingTokens.length} tokens...`);
        }
      } catch (error) {
        console.error(`\nError generating token for business ${business.id}:`, error.message);
      }
    }
    
    if (businessesNeedingTokens.length > 0) {
      console.log(`\r✓ Generated ${generated}/${businessesNeedingTokens.length} tokens`);
    }
    
    // Get final count
    const result = await sql`
      SELECT COUNT(*) as token_count
      FROM claim_campaigns
      WHERE campaign_name IN ('Auto-Generated', 'Retroactive Auto-Generated')`;
    
    console.log(`\n✅ Auto token generation setup completed!`);
    console.log(`Total auto-generated tokens in system: ${result[0].token_count}`);
    console.log('All new businesses will automatically get claim tokens.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

migrate();