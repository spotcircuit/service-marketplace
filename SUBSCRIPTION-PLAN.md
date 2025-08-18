# Subscription Model Implementation Options

## Current System Analysis

### What We Already Have:
1. **Lead Credits System** ✅
   - Pay-per-reveal model implemented
   - Current pricing: 10 credits/$200, 25/$450, 50/$800

2. **Featured Listings** ✅ (Partially)
   - Boost ($49), Featured ($99), Premium Spotlight ($199)
   - Visibility packages, not per-listing

3. **Claim/Verification Flow** ✅
   - Businesses can claim existing listings
   - Basic verification process

4. **Single Business Model**
   - 1 business = 1 location
   - No multi-location support yet

---

## Option C: Hybrid Quick Win (RECOMMENDED)

**Keep everything as-is, just add:**

### 1. Subscription Option in Dealer Portal
```
Current: Buy 10 credits for $200
NEW: Subscribe for $99/month, get 10 credits monthly (50% savings!)
```

### 2. "Setup Assistance" Service
- Add button: "Have us set up your profile - $199"
- Routes to Calendly/form for intake call
- Manual process initially (you or VA does setup)
- Use existing admin tools

### 3. Profile Completion Score
- Show "60% complete" type badges
- Unlock perks at milestones:
  - 50% = Show in search
  - 75% = Get featured badge
  - 100% = Priority support

### Implementation Changes Needed:
1. Add subscription plan to Stripe
2. Add webhook to refresh credits monthly
3. Add `profile_completion_score` calculation
4. Add setup assistance flag/workflow

**Timeline: 1-2 days**

---

## Option D: Focus on What Works

**Philosophy:** Businesses hate forms but love results

### Single Smart Track:

#### 1. Instant Activation
- Claim business in 30 seconds
- Immediately start receiving leads
- Pay only when you reveal contact ($20)

#### 2. Gradual Profile Building
- Each lead revealed prompts: "Add your response time to rank higher"
- Each week email: "Add photos to get 30% more leads"
- Gamify completion without blocking access

#### 3. Natural Upsells
- After 3 leads: "Save 50% with monthly plan"
- After profile 75% complete: "Go Featured for $49"
- After 10 leads/month: "You need our Pro plan"

### Implementation Changes Needed:
1. Remove barriers from claim flow
2. Add progressive profile prompts
3. Track engagement metrics
4. Smart upsell triggers

**Timeline: 3-4 days**

---

## Why Option C is Recommended:

1. **Minimal code changes** - Uses existing infrastructure
2. **Test the concept** - Validate before major refactoring
3. **Quick implementation** - Can deploy in 1-2 days
4. **Learn from data** - See what businesses actually want
5. **Immediate revenue** - Subscriptions + setup fees

## Key Insight:
Businesses don't want to choose between DIY and Done-For-You upfront. They want to try DIY, get frustrated, then pay for help. Make DIY dead simple, and offer assistance when they struggle.

---

## Implementation Priority:

### Phase 1 (Day 1):
- Add monthly subscription option to Stripe
- Create webhook for monthly credit refresh
- Add "Subscribe & Save" button to dealer portal

### Phase 2 (Day 2):
- Add "Request Setup Help" button
- Create simple admin queue for setup requests
- Add `setup_type` field to businesses table

### Phase 3 (Week 2):
- Calculate and display profile completion
- Add email nudges for incomplete profiles
- Track conversion metrics

### Phase 4 (Week 3):
- Implement smart upsell triggers
- A/B test pricing
- Optimize based on data

---

## Database Changes Required:

```sql
-- Add to businesses table
ALTER TABLE businesses
ADD COLUMN setup_type VARCHAR(50) DEFAULT 'diy', -- 'diy' or 'white_glove'
ADD COLUMN profile_completion_score INTEGER DEFAULT 0,
ADD COLUMN setup_requested_at TIMESTAMPTZ;

-- Add to business_subscriptions table  
ALTER TABLE business_subscriptions
ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'pay_per_lead', -- 'pay_per_lead', 'monthly', 'pro'
ADD COLUMN next_credit_refresh TIMESTAMPTZ,
ADD COLUMN monthly_credit_allowance INTEGER DEFAULT 0;
```

---

## Pricing Strategy:

### Pay-Per-Lead (Current):
- $20 per lead credit
- Good for: Low-volume businesses

### Monthly Subscription (New):
- $99/month for 10 credits (50% savings)
- Auto-refresh monthly
- Good for: Regular businesses

### Pro Subscription (Future):
- $299/month for 50 credits
- Priority support
- Advanced analytics
- Good for: High-volume businesses

### Add-Ons:
- Featured Listing: $49/month
- Setup Assistance: $199 one-time
- Rush Setup: $99 additional

---

## Success Metrics to Track:

1. **Conversion Rate**: Free → Paid
2. **Subscription Adoption**: % choosing monthly vs pay-per-lead
3. **Setup Assistance**: % requesting help
4. **Profile Completion**: Average score
5. **LTV**: Customer lifetime value by tier
6. **Churn Rate**: Monthly subscription cancellations

---

## Next Steps:

1. Review and choose between Option C or D
2. Set up Stripe subscription products
3. Implement chosen option
4. Launch to small test group
5. Iterate based on feedback