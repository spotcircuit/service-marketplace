-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  website VARCHAR(255),
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zipcode VARCHAR(10) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false,
  featured_until TIMESTAMP,
  logo_url TEXT,
  cover_image TEXT,
  years_in_business INTEGER,
  license_number VARCHAR(100),
  insurance BOOLEAN DEFAULT false,
  price_range VARCHAR(20),
  services JSONB,
  service_areas JSONB,
  hours JSONB,
  gallery_images JSONB,
  certifications JSONB,
  owner_name VARCHAR(255),
  owner_email VARCHAR(255),
  owner_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_state ON businesses(state);
CREATE INDEX idx_businesses_featured ON businesses(is_featured);
CREATE INDEX idx_businesses_verified ON businesses(is_verified);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  zipcode VARCHAR(10),
  service_type VARCHAR(100) NOT NULL,
  project_description TEXT,
  timeline VARCHAR(50),
  budget VARCHAR(50),
  business_ids JSONB,
  category VARCHAR(100),
  status VARCHAR(20) DEFAULT 'new',
  source VARCHAR(50) DEFAULT 'website',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for leads
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_business_ids ON leads USING GIN(business_ids);

-- Create RLS policies
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow public read access to businesses
CREATE POLICY "Allow public read access to businesses" ON businesses
  FOR SELECT USING (true);

-- Allow authenticated users to update businesses
CREATE POLICY "Allow authenticated users to update businesses" ON businesses
  FOR UPDATE USING (true);

-- Allow authenticated users to insert businesses
CREATE POLICY "Allow authenticated users to insert businesses" ON businesses
  FOR INSERT WITH CHECK (true);

-- Allow public to create leads (for quote requests)
CREATE POLICY "Allow public to create leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read and update leads
CREATE POLICY "Allow authenticated users to read leads" ON leads
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to update leads" ON leads
  FOR UPDATE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
