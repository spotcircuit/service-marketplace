CREATE TABLE IF NOT EXISTS claim_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_campaign_id UUID NOT NULL REFERENCES claim_campaigns(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_selected BOOLEAN DEFAULT true,
  email_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  email_sent_at TIMESTAMP,
  email_bounced_at TIMESTAMP,
  email_opened_at TIMESTAMP,
  link_clicked_at TIMESTAMP,
  UNIQUE(claim_campaign_id, email)
);

CREATE INDEX IF NOT EXISTS idx_claim_contacts_campaign ON claim_contacts(claim_campaign_id);
CREATE INDEX IF NOT EXISTS idx_claim_contacts_email ON claim_contacts(email);
CREATE INDEX IF NOT EXISTS idx_claim_contacts_selected ON claim_contacts(claim_campaign_id, is_selected);

CREATE OR REPLACE VIEW claim_campaigns_with_contacts AS
SELECT 
  cc.*,
  COUNT(DISTINCT con.id) as total_contacts,
  COUNT(DISTINCT CASE WHEN con.is_selected THEN con.id END) as selected_contacts,
  STRING_AGG(DISTINCT CASE WHEN con.is_selected THEN con.email END, '; ' ORDER BY con.email) as selected_emails
FROM claim_campaigns cc
LEFT JOIN claim_contacts con ON cc.id = con.claim_campaign_id
GROUP BY cc.id;