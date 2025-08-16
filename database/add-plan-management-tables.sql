-- Create plan price history table
CREATE TABLE IF NOT EXISTS plan_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2) NOT NULL,
  old_stripe_price_id VARCHAR(255),
  new_stripe_price_id VARCHAR(255),
  changed_by UUID REFERENCES users(id),
  change_reason TEXT,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create plan features table for more flexible feature management
CREATE TABLE IF NOT EXISTS plan_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  feature_name VARCHAR(255) NOT NULL,
  feature_value TEXT,
  feature_type VARCHAR(50) DEFAULT 'boolean', -- boolean, number, text
  display_order INTEGER DEFAULT 0,
  is_highlighted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create subscription migration records
CREATE TABLE IF NOT EXISTS subscription_migrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  business_id UUID REFERENCES businesses(id),
  old_plan_id UUID REFERENCES subscription_plans(id),
  new_plan_id UUID REFERENCES subscription_plans(id),
  old_stripe_price_id VARCHAR(255),
  new_stripe_price_id VARCHAR(255),
  migration_type VARCHAR(50), -- price_change, plan_upgrade, plan_downgrade
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
  scheduled_for TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_plan_price_history_plan_id ON plan_price_history(plan_id);
CREATE INDEX idx_plan_price_history_effective_date ON plan_price_history(effective_date);
CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_subscription_migrations_status ON subscription_migrations(status);
CREATE INDEX idx_subscription_migrations_scheduled ON subscription_migrations(scheduled_for);

-- Add columns to subscription_plans if they don't exist
ALTER TABLE subscription_plans
ADD COLUMN IF NOT EXISTS previous_stripe_price_ids JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS auto_upgrade_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS grandfather_pricing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS available_for_new_customers BOOLEAN DEFAULT true;

-- Create function to handle plan migrations
CREATE OR REPLACE FUNCTION migrate_subscriptions_to_new_price(
  p_old_price_id VARCHAR(255),
  p_new_price_id VARCHAR(255),
  p_migration_type VARCHAR(50) DEFAULT 'price_change'
) RETURNS INTEGER AS $$
DECLARE
  migration_count INTEGER := 0;
BEGIN
  -- Record all subscriptions that need migration
  INSERT INTO subscription_migrations (
    stripe_subscription_id,
    business_id,
    old_stripe_price_id,
    new_stripe_price_id,
    migration_type,
    status
  )
  SELECT
    sc.stripe_subscription_id,
    sc.business_id,
    p_old_price_id,
    p_new_price_id,
    p_migration_type,
    'pending'
  FROM stripe_customers sc
  WHERE sc.subscription_status = 'active';

  GET DIAGNOSTICS migration_count = ROW_COUNT;
  RETURN migration_count;
END;
$$ LANGUAGE plpgsql;

-- Add helpful views
CREATE OR REPLACE VIEW active_plan_prices AS
SELECT
  sp.id,
  sp.name,
  sp.description,
  sp.price,
  sp.stripe_price_id,
  sp.lead_credits,
  sp.is_active,
  COUNT(DISTINCT sc.business_id) as active_subscriptions,
  sp.available_for_new_customers
FROM subscription_plans sp
LEFT JOIN stripe_customers sc ON sc.subscription_status = 'active'
GROUP BY sp.id
ORDER BY sp.sort_order;

-- View for price change history
CREATE OR REPLACE VIEW plan_price_changes AS
SELECT
  sp.name as plan_name,
  pph.old_price,
  pph.new_price,
  pph.effective_date,
  pph.change_reason,
  u.name as changed_by_name,
  ROUND(((pph.new_price - pph.old_price) / pph.old_price * 100), 2) as percentage_change
FROM plan_price_history pph
JOIN subscription_plans sp ON pph.plan_id = sp.id
LEFT JOIN users u ON pph.changed_by = u.id
ORDER BY pph.effective_date DESC;
