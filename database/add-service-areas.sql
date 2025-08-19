-- Add service area support to businesses table
-- This migration adds fields for defining how businesses specify their service coverage

-- Add service area columns to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS service_radius_miles INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS service_zipcodes TEXT[] DEFAULT '{}';

-- Create featured_listings table for simplified featured status
CREATE TABLE IF NOT EXISTS featured_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT true,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_service_radius ON businesses(service_radius_miles);
CREATE INDEX IF NOT EXISTS idx_businesses_service_zipcodes ON businesses USING GIN(service_zipcodes);
CREATE INDEX IF NOT EXISTS idx_featured_listings_business ON featured_listings(business_id);
CREATE INDEX IF NOT EXISTS idx_featured_listings_expires ON featured_listings(expires_at);

-- Create trigger for featured_listings updated_at
CREATE TRIGGER update_featured_listings_updated_at
BEFORE UPDATE ON featured_listings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing featured businesses to new table
INSERT INTO featured_listings (business_id, expires_at, auto_renew)
SELECT 
  id as business_id,
  COALESCE(featured_until, NOW() + INTERVAL '30 days') as expires_at,
  true as auto_renew
FROM businesses
WHERE is_featured = true
  AND NOT EXISTS (
    SELECT 1 FROM featured_listings fl WHERE fl.business_id = businesses.id
  );

-- Function to check if a business services a location
CREATE OR REPLACE FUNCTION business_services_location(
  p_business_id UUID,
  p_customer_lat DECIMAL,
  p_customer_lng DECIMAL,
  p_customer_zipcode VARCHAR(10)
) RETURNS BOOLEAN AS $$
DECLARE
  v_business_lat DECIMAL;
  v_business_lng DECIMAL;
  v_service_radius_miles INTEGER;
  v_service_zipcodes TEXT[];
  v_distance_miles DECIMAL;
BEGIN
  -- Get business details
  SELECT 
    latitude,
    longitude,
    service_radius_miles,
    service_zipcodes
  INTO 
    v_business_lat,
    v_business_lng,
    v_service_radius_miles,
    v_service_zipcodes
  FROM businesses
  WHERE id = p_business_id;

  -- Check if zipcode matches
  IF p_customer_zipcode IS NOT NULL AND v_service_zipcodes IS NOT NULL THEN
    IF p_customer_zipcode = ANY(v_service_zipcodes) THEN
      RETURN TRUE;
    END IF;
  END IF;

  -- Check radius if we have coordinates
  IF v_business_lat IS NOT NULL AND v_business_lng IS NOT NULL 
     AND p_customer_lat IS NOT NULL AND p_customer_lng IS NOT NULL THEN
    -- Calculate distance using Haversine formula (approximation)
    v_distance_miles := (
      3959 * acos(
        cos(radians(p_customer_lat)) * cos(radians(v_business_lat)) *
        cos(radians(v_business_lng) - radians(p_customer_lng)) +
        sin(radians(p_customer_lat)) * sin(radians(v_business_lat))
      )
    );
    
    IF v_distance_miles <= COALESCE(v_service_radius_miles, 25) THEN
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Update all existing businesses to have default service radius
UPDATE businesses 
SET service_radius_miles = 25 
WHERE service_radius_miles IS NULL;