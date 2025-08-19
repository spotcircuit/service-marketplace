-- Add trial tracking to featured_listings table
ALTER TABLE featured_listings
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT false;

-- Update existing featured listings to mark them as not trial
UPDATE featured_listings SET is_trial = false, trial_used = true WHERE is_trial IS NULL;