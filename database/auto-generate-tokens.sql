-- Auto-generate claim tokens for new businesses
-- This ensures every business has a short claim URL from creation

-- Create trigger function to auto-generate claim token
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
        NOW() + INTERVAL '365 days', -- 1 year expiration for auto-generated tokens
        'Auto-Generated',
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_generate_claim_token_trigger ON businesses;

-- Create trigger on businesses table
CREATE TRIGGER auto_generate_claim_token_trigger
AFTER INSERT ON businesses
FOR EACH ROW
EXECUTE FUNCTION auto_generate_claim_token();

-- Generate tokens for all existing unclaimed businesses that don't have one
DO $$
DECLARE
  business_record RECORD;
  new_token VARCHAR(100);
BEGIN
  FOR business_record IN 
    SELECT b.id, b.email
    FROM businesses b
    LEFT JOIN claim_campaigns cc ON cc.business_id = b.id
    WHERE b.is_claimed = FALSE 
      AND b.email IS NOT NULL 
      AND b.email != ''
      AND cc.id IS NULL
  LOOP
    -- Generate token for this business
    SELECT generate_claim_token() INTO new_token;
    
    INSERT INTO claim_campaigns (
      business_id,
      claim_token,
      email_sent_to,
      expires_at,
      campaign_name,
      created_at
    ) VALUES (
      business_record.id,
      new_token,
      business_record.email,
      NOW() + INTERVAL '365 days',
      'Retroactive Auto-Generated',
      NOW()
    );
  END LOOP;
  
  RAISE NOTICE 'Generated tokens for all existing unclaimed businesses';
END $$;