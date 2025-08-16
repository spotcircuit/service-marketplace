-- Add business address fields to users table for business owners
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS business_address VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_zipcode VARCHAR(20),
ADD COLUMN IF NOT EXISTS business_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_phone VARCHAR(20);

-- Create indexes for business address fields
CREATE INDEX IF NOT EXISTS idx_users_business_city ON users(business_city);
CREATE INDEX IF NOT EXISTS idx_users_business_state ON users(business_state);
CREATE INDEX IF NOT EXISTS idx_users_business_zipcode ON users(business_zipcode);