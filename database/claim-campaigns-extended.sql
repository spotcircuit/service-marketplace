-- Add additional tracking columns to claim_campaigns table
ALTER TABLE claim_campaigns 
ADD COLUMN IF NOT EXISTS email_bounced_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS email_unsubscribed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS account_created_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS claim_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS claimed_by_user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS reachinbox_campaign_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS reachinbox_thread_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS tracking_data JSONB DEFAULT '{}';

-- Create index for ReachInbox IDs
CREATE INDEX IF NOT EXISTS idx_claim_campaigns_reachinbox_campaign 
ON claim_campaigns(reachinbox_campaign_id) 
WHERE reachinbox_campaign_id IS NOT NULL;

-- Create a comprehensive tracking view
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
JOIN businesses b ON cc.business_id = b.id;

-- Function to track account creation from claim campaign
CREATE OR REPLACE FUNCTION track_claim_account_creation(
  p_token VARCHAR(100),
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE claim_campaigns 
  SET 
    account_created_at = COALESCE(account_created_at, NOW()),
    claimed_by_user_id = p_user_id,
    updated_at = NOW()
  WHERE claim_token = p_token;
END;
$$ LANGUAGE plpgsql;

-- Function to track claim completion
CREATE OR REPLACE FUNCTION track_claim_completion(
  p_token VARCHAR(100),
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Update campaign
  UPDATE claim_campaigns 
  SET 
    claim_completed_at = NOW(),
    claimed_at = NOW(),
    claimed_by_user_id = p_user_id,
    updated_at = NOW()
  WHERE claim_token = p_token;
  
  -- Mark business as claimed
  UPDATE businesses 
  SET 
    is_claimed = true,
    updated_at = NOW()
  WHERE id = (
    SELECT business_id 
    FROM claim_campaigns 
    WHERE claim_token = p_token
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql;