#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function fixTokenGeneration() {
  const dbUrl = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_NEON_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = neon(dbUrl);
  
  try {
    console.log('Fixing token generation function...\n');
    
    // Update the function to use MD5 instead of gen_random_bytes
    await sql`
      CREATE OR REPLACE FUNCTION generate_claim_token()
      RETURNS VARCHAR(100) AS $$
      DECLARE
        new_token VARCHAR(100);
        done BOOLEAN DEFAULT FALSE;
        counter INTEGER DEFAULT 0;
      BEGIN
        WHILE NOT done LOOP
          -- Generate a random token using MD5 hash of random UUID
          new_token := LOWER(SUBSTRING(MD5(gen_random_uuid()::text || NOW()::text || counter::text), 1, 8));
          
          -- Check if token already exists
          IF NOT EXISTS (SELECT 1 FROM claim_campaigns WHERE claim_token = new_token) THEN
            done := TRUE;
          END IF;
          
          counter := counter + 1;
          
          -- Safety check to prevent infinite loop
          IF counter > 100 THEN
            RAISE EXCEPTION 'Could not generate unique token after 100 attempts';
          END IF;
        END LOOP;
        
        RETURN new_token;
      END;
      $$ LANGUAGE plpgsql`;
    
    console.log('✓ Token generation function fixed');
    
    // Now generate tokens for existing businesses
    console.log('\nGenerating tokens for existing unclaimed businesses...');
    
    const businessesNeedingTokens = await sql`
      SELECT b.id, b.email
      FROM businesses b
      LEFT JOIN claim_campaigns cc ON cc.business_id = b.id
      WHERE b.is_claimed = FALSE 
        AND b.email IS NOT NULL 
        AND b.email != ''
        AND cc.id IS NULL
      LIMIT 500`; // Process in batches
    
    console.log(`Processing first batch of ${businessesNeedingTokens.length} businesses...`);
    
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
            'Auto-Generated',
            NOW()
          )`;
        
        generated++;
        if (generated % 50 === 0) {
          console.log(`Generated ${generated} tokens...`);
        }
      } catch (error) {
        console.error(`Error for business ${business.id}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Successfully generated ${generated} tokens`);
    
    // Count remaining businesses
    const remaining = await sql`
      SELECT COUNT(*) as count
      FROM businesses b
      LEFT JOIN claim_campaigns cc ON cc.business_id = b.id
      WHERE b.is_claimed = FALSE 
        AND b.email IS NOT NULL 
        AND b.email != ''
        AND cc.id IS NULL`;
    
    if (remaining[0].count > 0) {
      console.log(`Note: ${remaining[0].count} businesses still need tokens.`);
      console.log('Run this script again to process more, or they will get tokens automatically when created.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixTokenGeneration();