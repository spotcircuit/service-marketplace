-- Add subscription tier support to existing tables
-- This migration adds support for monthly subscriptions and setup assistance

-- Add new columns to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS setup_type VARCHAR(50) DEFAULT 'diy', -- 'diy' or 'white_glove'
ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS setup_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS setup_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS setup_completed_by UUID REFERENCES users(id);

-- Add new columns to business_subscriptions table
ALTER TABLE business_subscriptions
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'pay_per_lead', -- 'pay_per_lead', 'monthly', 'pro'
ADD COLUMN IF NOT EXISTS next_credit_refresh TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS monthly_credit_allowance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_used_this_period INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255); -- For recurring subscriptions

-- Create setup assistance requests table
CREATE TABLE IF NOT EXISTS setup_assistance_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority VARCHAR(50) DEFAULT 'normal', -- 'normal', 'rush'
  assigned_to UUID REFERENCES users(id),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_setup_type ON businesses(setup_type);
CREATE INDEX IF NOT EXISTS idx_businesses_profile_completion ON businesses(profile_completion_score);
CREATE INDEX IF NOT EXISTS idx_setup_assistance_status ON setup_assistance_requests(status);
CREATE INDEX IF NOT EXISTS idx_setup_assistance_business ON setup_assistance_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_tier ON business_subscriptions(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_business_subscriptions_refresh ON business_subscriptions(next_credit_refresh);

-- Function to calculate profile completion score
CREATE OR REPLACE FUNCTION calculate_profile_completion(p_business_id UUID)
RETURNS INTEGER AS $$
DECLARE
  completion_percentage INTEGER := 0;
BEGIN
  -- Calculate based on actual business data
  SELECT 
    CASE WHEN name IS NOT NULL AND phone IS NOT NULL AND address IS NOT NULL THEN 25 ELSE 0 END +
    CASE WHEN description IS NOT NULL AND LENGTH(description) > 100 THEN 20 ELSE 0 END +
    CASE WHEN hours IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN photos IS NOT NULL AND jsonb_array_length(photos) > 0 THEN 20 ELSE 0 END +
    CASE WHEN service_areas IS NOT NULL AND jsonb_array_length(service_areas) > 0 THEN 10 ELSE 0 END +
    CASE WHEN is_verified = true OR is_claimed = true THEN 10 ELSE 0 END
  INTO completion_percentage
  FROM businesses
  WHERE id = p_business_id;
  
  RETURN COALESCE(completion_percentage, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to refresh monthly credits
CREATE OR REPLACE FUNCTION refresh_monthly_credits()
RETURNS void AS $$
BEGIN
  UPDATE business_subscriptions
  SET 
    lead_credits = lead_credits + monthly_credit_allowance,
    credits_used_this_period = 0,
    next_credit_refresh = CASE 
      WHEN subscription_tier IN ('monthly', 'pro') 
      THEN NOW() + INTERVAL '30 days'
      ELSE next_credit_refresh
    END,
    updated_at = NOW()
  WHERE 
    subscription_tier IN ('monthly', 'pro')
    AND status = 'active'
    AND (next_credit_refresh IS NULL OR next_credit_refresh <= NOW());
END;
$$ LANGUAGE plpgsql;

-- Update profile completion scores for all existing businesses
UPDATE businesses b
SET profile_completion_score = calculate_profile_completion(b.id);