-- Drop the old trigger that tries to update businesses.claim_token
DROP TRIGGER IF EXISTS auto_generate_claim_token_trigger ON businesses;
DROP FUNCTION IF EXISTS auto_generate_claim_token();

-- Create new function to insert into claim_campaigns
CREATE OR REPLACE FUNCTION create_claim_campaign_for_business()
RETURNS TRIGGER AS $$
DECLARE
    new_token VARCHAR(100);
    counter INT := 0;
BEGIN
    -- Generate a unique token
    LOOP
        new_token := LOWER(SUBSTRING(MD5(gen_random_uuid()::text || NOW()::text || counter::text), 1, 8));
        
        -- Check if token already exists
        IF NOT EXISTS (SELECT 1 FROM claim_campaigns WHERE claim_token = new_token) THEN
            EXIT; -- Token is unique, exit loop
        END IF;
        
        counter := counter + 1;
        
        -- Prevent infinite loop
        IF counter > 100 THEN
            RAISE EXCEPTION 'Could not generate unique token';
        END IF;
    END LOOP;
    
    -- Insert new claim campaign for the business
    INSERT INTO claim_campaigns (
        business_id,
        claim_token,
        expires_at,
        created_at
    ) VALUES (
        NEW.id,
        new_token,
        NOW() + INTERVAL '30 days',
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on businesses table
CREATE TRIGGER create_claim_campaign_trigger
AFTER INSERT ON businesses
FOR EACH ROW
EXECUTE FUNCTION create_claim_campaign_for_business();

-- Generate campaigns for existing businesses without campaigns
INSERT INTO claim_campaigns (business_id, claim_token, expires_at, created_at)
SELECT 
    b.id,
    LOWER(SUBSTRING(MD5(gen_random_uuid()::text || b.id::text || NOW()::text), 1, 8)),
    NOW() + INTERVAL '30 days',
    NOW()
FROM businesses b
LEFT JOIN claim_campaigns cc ON b.id = cc.business_id
WHERE cc.id IS NULL;

-- Verify the results
SELECT 
    (SELECT COUNT(*) FROM businesses) as total_businesses,
    (SELECT COUNT(*) FROM claim_campaigns) as total_campaigns,
    (SELECT COUNT(*) FROM businesses b LEFT JOIN claim_campaigns cc ON b.id = cc.business_id WHERE cc.id IS NULL) as businesses_without_campaigns;