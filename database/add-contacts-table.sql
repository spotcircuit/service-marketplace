-- Create contacts table for one-to-many relationship with businesses
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Contact Information
  name VARCHAR(255),
  title VARCHAR(100),
  department VARCHAR(100),

  -- Communication
  phone VARCHAR(20),
  phone_type VARCHAR(20) DEFAULT 'main', -- main, mobile, office, fax, toll-free
  email VARCHAR(255),
  email_type VARCHAR(20) DEFAULT 'general', -- general, sales, support, billing

  -- Additional Info
  is_primary BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  available_hours VARCHAR(255),
  languages JSONB, -- ["English", "Spanish", etc.]
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_contacts_business_id ON contacts(business_id);
CREATE INDEX idx_contacts_is_primary ON contacts(is_primary);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_email ON contacts(email);

-- Create trigger for updated_at
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to contacts
CREATE POLICY "Allow public read access to contacts" ON contacts
  FOR SELECT USING (is_public = true);

-- Allow business owners to manage their contacts
CREATE POLICY "Allow business owners to manage contacts" ON contacts
  FOR ALL USING (true); -- This would check ownership in production

-- Migrate existing phone/email data to contacts table
INSERT INTO contacts (business_id, phone, phone_type, email, email_type, is_primary, name, title)
SELECT
  id as business_id,
  phone,
  'main' as phone_type,
  email,
  'general' as email_type,
  true as is_primary,
  owner_name as name,
  'Owner' as title
FROM businesses
WHERE phone IS NOT NULL OR email IS NOT NULL;

-- Add a view for easy access to primary contacts
CREATE OR REPLACE VIEW business_primary_contacts AS
SELECT
  b.id as business_id,
  b.name as business_name,
  c.name as contact_name,
  c.title,
  c.phone,
  c.email
FROM businesses b
LEFT JOIN contacts c ON b.id = c.business_id AND c.is_primary = true;

-- Function to get all contacts for a business
CREATE OR REPLACE FUNCTION get_business_contacts(business_uuid UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  title VARCHAR,
  phone VARCHAR,
  phone_type VARCHAR,
  email VARCHAR,
  email_type VARCHAR,
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.title,
    c.phone,
    c.phone_type,
    c.email,
    c.email_type,
    c.is_primary
  FROM contacts c
  WHERE c.business_id = business_uuid
  ORDER BY c.is_primary DESC, c.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to add a contact to a business
CREATE OR REPLACE FUNCTION add_business_contact(
  p_business_id UUID,
  p_name VARCHAR DEFAULT NULL,
  p_title VARCHAR DEFAULT NULL,
  p_phone VARCHAR DEFAULT NULL,
  p_phone_type VARCHAR DEFAULT 'main',
  p_email VARCHAR DEFAULT NULL,
  p_email_type VARCHAR DEFAULT 'general',
  p_is_primary BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  v_contact_id UUID;
BEGIN
  -- If marking as primary, unmark other primary contacts
  IF p_is_primary THEN
    UPDATE contacts
    SET is_primary = false
    WHERE business_id = p_business_id;
  END IF;

  -- Insert new contact
  INSERT INTO contacts (
    business_id, name, title, phone, phone_type,
    email, email_type, is_primary
  ) VALUES (
    p_business_id, p_name, p_title, p_phone, p_phone_type,
    p_email, p_email_type, p_is_primary
  ) RETURNING id INTO v_contact_id;

  RETURN v_contact_id;
END;
$$ LANGUAGE plpgsql;
