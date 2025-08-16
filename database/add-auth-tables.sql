-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer', -- admin, business_owner, customer
  phone VARCHAR(20),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMP WITH TIME ZONE,

  -- Business owner specific fields
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  company_name VARCHAR(255),

  -- Metadata
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create sessions table for auth sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create site_configurations table for admin settings
CREATE TABLE IF NOT EXISTS site_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category VARCHAR(100), -- general, hero, theme, email, payment, etc.
  description TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notifications_email BOOLEAN DEFAULT true,
  notifications_sms BOOLEAN DEFAULT false,
  newsletter BOOLEAN DEFAULT true,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_business_id ON users(business_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_site_configurations_key ON site_configurations(key);
CREATE INDEX idx_site_configurations_category ON site_configurations(category);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_configurations_updated_at
BEFORE UPDATE ON site_configurations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (brian@spotcircuit.com)
-- Password: Admin123! (you should change this on first login)
-- Note: In production, use proper password hashing
INSERT INTO users (email, password_hash, name, role, email_verified)
VALUES (
  'brian@spotcircuit.com',
  '$2a$10$YourHashedPasswordHere', -- This will be replaced with actual hash
  'Brian',
  'admin',
  true
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Insert default site configurations
INSERT INTO site_configurations (key, value, category, description) VALUES
  ('site_name', '"Hometown Dumpster Rental"', 'general', 'Site name displayed in header and title'),
  ('site_tagline', '"Find Trusted Local Service Providers"', 'general', 'Main tagline on homepage'),
  ('contact_email', '"support@hometowndumpster.com"', 'general', 'Main contact email'),
  ('contact_phone', '"1-800-DUMPSTER"', 'general', 'Main contact phone'),
  ('hero_title', '"Find Trusted Local Service Providers"', 'hero', 'Hero section title'),
  ('hero_subtitle', '"Connect with verified professionals in your area"', 'hero', 'Hero section subtitle'),
  ('primary_color', '"#F97316"', 'theme', 'Primary brand color'),
  ('secondary_color', '"#16A34A"', 'theme', 'Secondary brand color'),
  ('categories', '["Dumpster Rental", "Junk Removal", "Demolition", "Construction Cleanup"]', 'general', 'Available service categories'),
  ('featured_cities', '["Houston", "Richmond", "Charlotte", "Atlanta"]', 'general', 'Featured cities on homepage'),
  ('business_claim_enabled', 'true', 'features', 'Allow businesses to claim listings'),
  ('lead_generation_enabled', 'true', 'features', 'Enable lead generation system'),
  ('reviews_enabled', 'true', 'features', 'Enable customer reviews'),
  ('stripe_enabled', 'false', 'payment', 'Enable Stripe payments'),
  ('email_provider', '"none"', 'email', 'Email service provider (sendgrid, resend, etc)')
ON CONFLICT (key) DO NOTHING;
