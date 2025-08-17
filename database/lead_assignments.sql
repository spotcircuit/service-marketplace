-- Create lead_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS lead_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'won', 'lost')),
  notes TEXT,
  quoted_price DECIMAL(10,2),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(lead_id, business_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lead_assignments_business_id ON lead_assignments(business_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_status ON lead_assignments(status);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_updated_at ON lead_assignments(updated_at);

-- Enable RLS
ALTER TABLE lead_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Businesses can view their own lead assignments"
  ON lead_assignments FOR SELECT
  USING (business_id IN (
    SELECT business_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Businesses can update their own lead assignments"
  ON lead_assignments FOR UPDATE
  USING (business_id IN (
    SELECT business_id FROM users WHERE id = auth.uid()
  ));