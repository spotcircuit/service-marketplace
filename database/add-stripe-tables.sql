-- Create stripe_config table for storing Stripe settings
CREATE TABLE IF NOT EXISTS stripe_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create subscription_plans table for Stripe products
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  stripe_product_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  interval VARCHAR(20) DEFAULT 'month', -- month, year
  lead_credits INTEGER DEFAULT 0, -- -1 for unlimited
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  stripe_payment_intent_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- pending, succeeded, failed, canceled
  type VARCHAR(50) NOT NULL, -- subscription, one_time, credit_purchase
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create stripe_customers table to link businesses with Stripe customers
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_subscription_id VARCHAR(255),
  subscription_status VARCHAR(50), -- active, canceled, past_due, trialing
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(business_id)
);

-- Create indexes
CREATE INDEX idx_stripe_config_key ON stripe_config(key);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX idx_payment_transactions_business_id ON payment_transactions(business_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_stripe_customers_business_id ON stripe_customers(business_id);
CREATE INDEX idx_stripe_customers_stripe_customer_id ON stripe_customers(stripe_customer_id);

-- Create triggers
CREATE TRIGGER update_stripe_config_updated_at
BEFORE UPDATE ON stripe_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
BEFORE UPDATE ON subscription_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
BEFORE UPDATE ON payment_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_customers_updated_at
BEFORE UPDATE ON stripe_customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default Stripe configuration keys (values to be set in admin)
INSERT INTO stripe_config (key, value, is_encrypted, description) VALUES
  ('stripe_publishable_key', '', false, 'Stripe publishable key (starts with pk_)'),
  ('stripe_secret_key', '', true, 'Stripe secret key (starts with sk_) - Keep this secure!'),
  ('stripe_webhook_secret', '', true, 'Stripe webhook endpoint secret for verifying webhooks'),
  ('stripe_mode', 'test', false, 'Stripe mode: test or live'),
  ('stripe_enabled', 'false', false, 'Enable/disable Stripe payments'),
  ('trial_days', '14', false, 'Number of days for free trial'),
  ('auto_charge', 'true', false, 'Automatically charge for leads or require manual approval')
ON CONFLICT (key) DO NOTHING;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, lead_credits, features, sort_order, is_active) VALUES
  ('Free', 'Basic listing with limited leads', 0, 10,
   '["Basic business listing", "10 leads per month", "Customer reviews", "Basic support"]',
   0, true),
  ('Starter', 'Great for small businesses', 49, 50,
   '["Everything in Free", "50 leads per month", "Featured badge", "Priority in search", "Email notifications", "Basic analytics"]',
   1, true),
  ('Professional', 'Perfect for growing businesses', 99, 200,
   '["Everything in Starter", "200 leads per month", "Top placement in search", "Advanced analytics", "Custom branding", "Priority support"]',
   2, true),
  ('Enterprise', 'For established businesses', 299, -1,
   '["Everything in Professional", "Unlimited leads", "Premium placement", "API access", "Dedicated account manager", "Custom integrations"]',
   3, true)
ON CONFLICT DO NOTHING;
