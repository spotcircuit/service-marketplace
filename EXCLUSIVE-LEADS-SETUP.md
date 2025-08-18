# Setting Up Exclusive Leads System

## Current System Analysis
You already have most of the infrastructure:
- ✅ Lead capture forms (quote requests)
- ✅ Business database with locations
- ✅ Lead assignment system
- ✅ Credit system for billing

## Implementation Options

### Option 1: ZIP Code Exclusivity (Easiest)
**How it works:** One provider per ZIP code

```sql
-- Add to businesses table
ALTER TABLE businesses ADD COLUMN exclusive_zipcodes TEXT[];
ALTER TABLE businesses ADD COLUMN is_exclusive BOOLEAN DEFAULT FALSE;
ALTER TABLE businesses ADD COLUMN exclusive_until DATE;

-- Example: Give a business exclusive rights to certain ZIPs
UPDATE businesses 
SET exclusive_zipcodes = ARRAY['20147', '20148', '20149'],
    is_exclusive = true,
    exclusive_until = '2025-12-31'
WHERE id = 'business-id';
```

**Lead Assignment Logic:**
```javascript
// In your lead assignment API
async function assignLead(lead) {
  // First, check for exclusive provider in that ZIP
  const exclusiveProvider = await sql`
    SELECT * FROM businesses 
    WHERE ${lead.zipcode} = ANY(exclusive_zipcodes)
    AND is_exclusive = true
    AND exclusive_until > NOW()
    LIMIT 1
  `;
  
  if (exclusiveProvider) {
    return assignToProvider(lead, exclusiveProvider);
  }
  
  // Fall back to regular assignment
  return regularLeadAssignment(lead);
}
```

### Option 2: City-Based Exclusivity (Recommended)
**How it works:** One provider per city/service area

```sql
-- Add exclusive territories table
CREATE TABLE exclusive_territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  city VARCHAR(255),
  state VARCHAR(2),
  exclusive_until DATE,
  lead_price DECIMAL(10,2), -- Their special rate
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_exclusive_city_state ON exclusive_territories(city, state);
```

**Implementation:**
```javascript
// Check exclusivity
async function getExclusiveProvider(city, state) {
  const result = await sql`
    SELECT b.*, et.lead_price 
    FROM exclusive_territories et
    JOIN businesses b ON b.id = et.business_id
    WHERE LOWER(et.city) = LOWER(${city})
    AND et.state = ${state}
    AND et.exclusive_until > NOW()
    AND b.credits > et.lead_price  -- Has credits
    LIMIT 1
  `;
  return result[0];
}
```

### Option 3: Radius-Based Exclusivity (Most Complex)
**How it works:** Exclusive rights within X miles of a point

```sql
-- Add geographic exclusivity
ALTER TABLE businesses 
ADD COLUMN exclusive_lat DECIMAL(10,8),
ADD COLUMN exclusive_lng DECIMAL(10,8),
ADD COLUMN exclusive_radius_miles INTEGER;

-- Find exclusive provider using PostGIS or distance formula
SELECT * FROM businesses
WHERE ST_DWithin(
  ST_MakePoint(exclusive_lng, exclusive_lat)::geography,
  ST_MakePoint(${lead_lng}, ${lead_lat})::geography,
  exclusive_radius_miles * 1609.34  -- Convert miles to meters
);
```

## Recommended Implementation Plan

### Phase 1: Basic City Exclusivity (Week 1)

1. **Database Changes:**
```sql
-- Simple exclusive flag on businesses
ALTER TABLE businesses 
ADD COLUMN exclusive_cities TEXT[] DEFAULT '{}',
ADD COLUMN is_exclusive_partner BOOLEAN DEFAULT FALSE,
ADD COLUMN exclusive_pricing DECIMAL(10,2);

-- Track exclusive leads
ALTER TABLE leads 
ADD COLUMN is_exclusive BOOLEAN DEFAULT FALSE,
ADD COLUMN exclusive_business_id UUID;
```

2. **Update Lead Assignment:**
```javascript
// /src/app/api/leads/route.ts
async function createLead(leadData) {
  // Check for exclusive partner
  const exclusivePartner = await sql`
    SELECT * FROM businesses 
    WHERE is_exclusive_partner = true
    AND LOWER(${leadData.city}) = ANY(
      SELECT LOWER(unnest(exclusive_cities))
    )
    AND credits > exclusive_pricing
    LIMIT 1
  `;
  
  if (exclusivePartner) {
    // Assign exclusively
    leadData.is_exclusive = true;
    leadData.exclusive_business_id = exclusivePartner.id;
    leadData.assigned_businesses = [exclusivePartner.id];
    
    // Deduct credits
    await deductCredits(exclusivePartner.id, exclusivePartner.exclusive_pricing);
    
    // Send notification
    await sendExclusiveLeadNotification(exclusivePartner, leadData);
  } else {
    // Regular multi-business assignment
    await regularLeadAssignment(leadData);
  }
}
```

### Phase 2: Admin Interface (Week 2)

1. **Add Exclusive Partner Management:**
```jsx
// /src/app/admin/exclusive-partners/page.tsx
export default function ExclusivePartners() {
  return (
    <div>
      <h1>Exclusive Territory Management</h1>
      
      {/* List exclusive partners */}
      <ExclusivePartnersList />
      
      {/* Add/Edit exclusive territories */}
      <AddExclusiveTerritory />
      
      {/* Territory map visualization */}
      <TerritoryMap />
    </div>
  );
}
```

2. **Partner Dashboard Updates:**
```jsx
// Show exclusive status
{business.is_exclusive_partner && (
  <div className="bg-yellow-100 p-4 rounded">
    <h3>🏆 Exclusive Partner</h3>
    <p>You have exclusive rights to leads in:</p>
    <ul>
      {business.exclusive_cities.map(city => (
        <li key={city}>{city}</li>
      ))}
    </ul>
  </div>
)}
```

### Phase 3: Pricing & Contracts (Week 3)

1. **Exclusive Pricing Tiers:**
```javascript
const EXCLUSIVE_PRICING = {
  small_city: {  // < 50k population
    monthly_fee: 299,
    lead_price: 15,
    min_commitment: 6  // months
  },
  medium_city: {  // 50k-200k
    monthly_fee: 599,
    lead_price: 20,
    min_commitment: 6
  },
  large_city: {  // 200k+
    monthly_fee: 999,
    lead_price: 25,
    min_commitment: 12
  }
};
```

2. **Contract Management:**
```sql
CREATE TABLE exclusive_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  contract_start DATE,
  contract_end DATE,
  monthly_fee DECIMAL(10,2),
  lead_price DECIMAL(10,2),
  territories TEXT[],
  auto_renew BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'active'
);
```

## Quick & Dirty Solution (Can Do Today)

If you want to start immediately without code changes:

1. **Manual Assignment Process:**
   - Mark certain businesses as "exclusive" in your database
   - When leads come in, manually check the city
   - Assign to exclusive partner if they have one
   - Use a spreadsheet to track exclusive territories

2. **Simple Database Flag:**
```sql
-- Just add one field
ALTER TABLE businesses 
ADD COLUMN exclusive_notes TEXT;

-- Example: "EXCLUSIVE: Richmond, VA | Ashburn, VA | $20/lead"
UPDATE businesses 
SET exclusive_notes = 'EXCLUSIVE: Richmond, VA | $20/lead'
WHERE id = 'abc123';
```

3. **Update Your Sales Pitch:**
   - Start selling exclusive territories now
   - Manually manage assignments initially
   - Build the automation as you grow

## Challenges to Consider

1. **Territory Conflicts:**
   - What if someone is exclusive in "Richmond" but lead says "Richmond Metro"?
   - Solution: Normalize city names, use ZIP codes as backup

2. **Lead Volume:**
   - What if exclusive partner can't handle all leads?
   - Solution: Set daily/weekly caps, overflow to non-exclusive

3. **Pricing:**
   - Exclusive partners expect better pricing
   - But they also get ALL leads (no competition)
   - Find the sweet spot

4. **Contract Terms:**
   - Minimum commitments (6-12 months)
   - Performance requirements (must maintain response time)
   - Territory protection clauses

## Migration Strategy

1. **Start with top cities** - Pick 10 cities, find exclusive partners
2. **Grandfather existing providers** - Give them first dibs on exclusive rights
3. **Use as upsell** - "Upgrade to exclusive for 2x more leads"
4. **Market test pricing** - Start high, adjust based on demand

## ROI Calculator for Providers

Show them the math:
```
Current (HomeAdvisor):
- 50 leads × $75 = $3,750/month
- Shared with 4 competitors
- Close rate: 20% = 10 jobs
- Cost per job: $375

Exclusive with DumpQuote:
- 50 leads × $25 = $1,250/month  
- Plus monthly fee: $500
- Total: $1,750/month
- No competition
- Close rate: 40% = 20 jobs
- Cost per job: $87.50

Savings: $2,000/month + 2x more jobs
```

## The Easiest Path Forward

1. **Today:** Add `is_exclusive` and `exclusive_cities` fields to businesses table
2. **Tomorrow:** Update lead assignment to check for exclusive partners
3. **This Week:** Start selling exclusive territories to best performers
4. **Next Month:** Build proper admin interface

Would you like me to write the actual code changes for the quickest implementation?