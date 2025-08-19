-- Create table for tracking claim email campaigns
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
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claim_campaigns_token ON claim_campaigns(claim_token);
CREATE INDEX IF NOT EXISTS idx_claim_campaigns_business_id ON claim_campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_claim_campaigns_expires_at ON claim_campaigns(expires_at);

-- Create a view for unclaimed businesses with their latest campaign info
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
  AND b.email != '';

-- Function to generate a unique claim token
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
$$ LANGUAGE plpgsql;