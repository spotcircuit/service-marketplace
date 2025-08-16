-- Add location and service management fields to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS customer_types VARCHAR(50)[] DEFAULT ARRAY['residential', 'commercial'],
ADD COLUMN IF NOT EXISTS service_radius INTEGER DEFAULT 25, -- miles
ADD COLUMN IF NOT EXISTS minimum_rental_period INTEGER DEFAULT 1, -- days
ADD COLUMN IF NOT EXISTS same_day_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_geocoded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMP;

-- Add indexes for better querying
CREATE INDEX IF NOT EXISTS idx_businesses_customer_types ON businesses USING GIN(customer_types);
CREATE INDEX IF NOT EXISTS idx_businesses_service_radius ON businesses(service_radius);
CREATE INDEX IF NOT EXISTS idx_businesses_same_day ON businesses(same_day_available);
CREATE INDEX IF NOT EXISTS idx_businesses_geocoded ON businesses(is_geocoded);
CREATE INDEX IF NOT EXISTS idx_businesses_lat_lng ON businesses(latitude, longitude);

-- Add comment descriptions
COMMENT ON COLUMN businesses.customer_types IS 'Types of customers served: residential, commercial, or both';
COMMENT ON COLUMN businesses.service_radius IS 'Service radius in miles from business location';
COMMENT ON COLUMN businesses.minimum_rental_period IS 'Minimum rental period in days';
COMMENT ON COLUMN businesses.same_day_available IS 'Whether same-day delivery is available';
COMMENT ON COLUMN businesses.is_geocoded IS 'Whether the address has been geocoded to lat/lng';
COMMENT ON COLUMN businesses.geocoded_at IS 'Timestamp when the address was geocoded';