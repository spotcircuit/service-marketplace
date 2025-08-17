-- Create pending_claims table for admin approval workflow
CREATE TABLE IF NOT EXISTS pending_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(business_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_pending_claims_status ON pending_claims(status);
CREATE INDEX idx_pending_claims_business_id ON pending_claims(business_id);
CREATE INDEX idx_pending_claims_user_id ON pending_claims(user_id);

-- Enable RLS
ALTER TABLE pending_claims ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own pending claims
CREATE POLICY "Users can view own pending claims" ON pending_claims
  FOR SELECT
  USING (user_id = current_user_id());

-- Policy for admins to view all pending claims
CREATE POLICY "Admins can view all pending claims" ON pending_claims
  FOR ALL
  USING (current_user_role() = 'admin');

-- Function to get current user role
CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_user_role', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user id
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true)::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;