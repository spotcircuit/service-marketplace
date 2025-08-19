-- Add field to track data source/quality
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'unknown';

-- Add enum-like check constraint
ALTER TABLE businesses 
ADD CONSTRAINT check_data_source 
CHECK (data_source IN ('real', 'mock', 'scraped', 'claimed', 'unknown'));

-- Mark likely mock data (overly complete records)
UPDATE businesses 
SET data_source = 'mock'
WHERE description IS NOT NULL 
  AND years_in_business IS NOT NULL
  AND services IS NOT NULL
  AND hours IS NOT NULL
  AND gallery_images IS NOT NULL
  AND logo_url IS NOT NULL
  AND is_claimed = false;

-- Mark claimed businesses as real
UPDATE businesses 
SET data_source = 'claimed'
WHERE is_claimed = true;

-- Mark likely scraped/real data (minimal fields)
UPDATE businesses 
SET data_source = 'scraped'
WHERE email IS NOT NULL 
  AND (description IS NULL OR description = '' OR years_in_business IS NULL OR hours IS NULL)
  AND is_claimed = false;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_businesses_data_source ON businesses(data_source);