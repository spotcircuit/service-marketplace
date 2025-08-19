-- Identify mock data for deletion
-- Mock data characteristics:
-- 1. Has both logo_url AND gallery_images (real scraped data rarely has both)
-- 2. Has years_in_business (not typically scraped from Google Maps)
-- 3. Has complete services and hours data
-- 4. Has price_range filled (not typical for scraped data)
-- 5. Claimed businesses are mostly test data

-- First, let's identify what to keep (real data)
CREATE TEMP TABLE businesses_to_keep AS
SELECT id, name, city, state, email
FROM businesses
WHERE 
  -- Keep businesses that look like real scraped data
  (
    -- Missing typical mock fields
    (logo_url IS NULL OR gallery_images IS NULL) 
    AND (years_in_business IS NULL OR price_range IS NULL)
  )
  OR
  -- Keep businesses with only basic fields (typical of real scraped data)
  (
    website IS NOT NULL 
    AND logo_url IS NULL 
    AND gallery_images IS NULL
  )
  OR
  -- Keep specific known real businesses (adjust as needed)
  name IN (
    'Budget Bins Columbus',
    'ABC Dumpster Rentals',
    'SpotCircuit - west'  -- This one seems real even though claimed
  );

-- Count what we're keeping vs deleting
SELECT 
  'Total Businesses' as category,
  COUNT(*) as count
FROM businesses
UNION ALL
SELECT 
  'To Keep (Real)' as category,
  COUNT(*) as count
FROM businesses_to_keep
UNION ALL
SELECT 
  'To Delete (Mock)' as category,
  COUNT(*) as count
FROM businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM businesses_to_keep k WHERE k.id = b.id
);

-- Preview some businesses that will be deleted
SELECT 
  'WILL DELETE' as action,
  b.name,
  b.city,
  b.state,
  b.email,
  b.is_claimed,
  CASE 
    WHEN b.logo_url IS NOT NULL AND b.gallery_images IS NOT NULL THEN 'Has both media'
    WHEN b.years_in_business IS NOT NULL AND b.price_range IS NOT NULL THEN 'Too complete'
    WHEN b.is_claimed = true THEN 'Test claim'
    ELSE 'Other mock pattern'
  END as reason
FROM businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM businesses_to_keep k WHERE k.id = b.id
)
LIMIT 20;

-- Preview some businesses that will be kept
SELECT 
  'WILL KEEP' as action,
  b.name,
  b.city,
  b.state,
  b.email,
  b.website IS NOT NULL as has_website,
  b.logo_url IS NOT NULL as has_logo,
  b.gallery_images IS NOT NULL as has_gallery
FROM businesses b
WHERE EXISTS (
  SELECT 1 FROM businesses_to_keep k WHERE k.id = b.id
)
LIMIT 20;