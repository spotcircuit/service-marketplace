-- Fix token generation to not rely on gen_random_bytes
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
$$ LANGUAGE plpgsql;