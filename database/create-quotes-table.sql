-- Create quotes table for tracking customer quote requests to businesses
CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Customer information
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_zipcode VARCHAR(10),
    
    -- Business information (can be null for general quotes)
    business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
    business_name VARCHAR(255),
    
    -- Quote details
    service_type VARCHAR(100) NOT NULL,
    project_description TEXT,
    timeline VARCHAR(50), -- 'asap', 'within_week', 'within_month', 'flexible'
    budget VARCHAR(50), -- 'not_sure', 'under_500', '500_1000', etc.
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'viewed', 'responded', 'accepted', 'declined', 'expired'
    viewed_at TIMESTAMP,
    responded_at TIMESTAMP,
    response_message TEXT,
    
    -- Metadata
    source VARCHAR(50), -- 'website', 'mobile', 'api'
    referrer VARCHAR(255), -- page where quote was requested from
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_business_id ON quotes(business_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_quotes_service_type ON quotes(service_type);

-- Create quote_responses table for business responses
CREATE TABLE IF NOT EXISTS quote_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    
    -- Response details
    message TEXT NOT NULL,
    price_estimate DECIMAL(10, 2),
    availability_date DATE,
    valid_until DATE,
    
    -- Attachments/documents
    attachments JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'viewed', 'accepted', 'declined'
    viewed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quote_responses_quote_id ON quote_responses(quote_id);
CREATE INDEX idx_quote_responses_business_id ON quote_responses(business_id);

-- Add RLS policies
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_responses ENABLE ROW LEVEL SECURITY;

-- Customers can view their own quotes
CREATE POLICY "Customers can view own quotes" ON quotes
    FOR SELECT USING (auth.uid() = customer_id);

-- Businesses can view quotes sent to them
CREATE POLICY "Businesses can view their quotes" ON quotes
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM businesses WHERE id = quotes.business_id
        )
    );

-- Anyone can insert quotes (for non-logged in users)
CREATE POLICY "Anyone can create quotes" ON quotes
    FOR INSERT WITH CHECK (true);

-- Customers can update their own quotes
CREATE POLICY "Customers can update own quotes" ON quotes
    FOR UPDATE USING (auth.uid() = customer_id);

-- Businesses can update quotes sent to them (mark as viewed, etc)
CREATE POLICY "Businesses can update their quotes" ON quotes
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM businesses WHERE id = quotes.business_id
        )
    );