-- Create business_subscriptions table for tracking business subscriptions
CREATE TABLE IF NOT EXISTS business_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(100) NOT NULL DEFAULT 'Free',
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing, pending
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  lead_credits INTEGER DEFAULT 0,
  leads_received INTEGER DEFAULT 0,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  UNIQUE(business_id)
);

-- Create indexes
CREATE INDEX idx_business_subscriptions_business_id ON business_subscriptions(business_id);
CREATE INDEX idx_business_subscriptions_user_id ON business_subscriptions(user_id);
CREATE INDEX idx_business_subscriptions_status ON business_subscriptions(status);
CREATE INDEX idx_business_subscriptions_stripe_subscription_id ON business_subscriptions(stripe_subscription_id);

-- Create trigger for updated_at
CREATE TRIGGER update_business_subscriptions_updated_at
BEFORE UPDATE ON business_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default free subscriptions for existing businesses
INSERT INTO business_subscriptions (business_id, user_id, plan, status, lead_credits)
SELECT 
  b.id as business_id,
  u.id as user_id,
  'Free' as plan,
  'active' as status,
  10 as lead_credits
FROM businesses b
LEFT JOIN users u ON u.business_id = b.id
WHERE NOT EXISTS (
  SELECT 1 FROM business_subscriptions bs WHERE bs.business_id = b.id
);