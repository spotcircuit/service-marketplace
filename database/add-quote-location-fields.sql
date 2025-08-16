-- Add service location fields to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS service_address TEXT,
ADD COLUMN IF NOT EXISTS service_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS service_state VARCHAR(50),
ADD COLUMN IF NOT EXISTS service_area VARCHAR(255);

-- Add comments to explain the fields
COMMENT ON COLUMN quotes.service_address IS 'The full address where the service is to be performed';
COMMENT ON COLUMN quotes.service_city IS 'City where service is needed';
COMMENT ON COLUMN quotes.service_state IS 'State where service is needed';
COMMENT ON COLUMN quotes.service_area IS 'General service area/region for matching with businesses';

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_quotes_service_city ON quotes(service_city);
CREATE INDEX IF NOT EXISTS idx_quotes_service_state ON quotes(service_state);
CREATE INDEX IF NOT EXISTS idx_quotes_service_area ON quotes(service_area);