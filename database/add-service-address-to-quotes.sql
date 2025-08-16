-- Add service_address field to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS service_address TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN quotes.service_address IS 'The address where the service is to be performed (may differ from customer address)';