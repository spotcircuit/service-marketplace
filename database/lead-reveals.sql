-- Create lead_reveals table to track which businesses have revealed which leads
CREATE TABLE IF NOT EXISTS lead_reveals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  credits_used INTEGER DEFAULT 1,
  revealed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a business can only reveal a lead once
  UNIQUE(lead_id, business_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_reveals_lead_id ON lead_reveals(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_reveals_business_id ON lead_reveals(business_id);
CREATE INDEX IF NOT EXISTS idx_lead_reveals_revealed_at ON lead_reveals(revealed_at);

-- Enable RLS
ALTER TABLE lead_reveals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Businesses can view their own lead reveals"
  ON lead_reveals FOR SELECT
  USING (business_id IN (
    SELECT business_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Businesses can insert their own lead reveals"
  ON lead_reveals FOR INSERT
  WITH CHECK (business_id IN (
    SELECT business_id FROM users WHERE id = auth.uid()
  ));