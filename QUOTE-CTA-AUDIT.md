# Quote CTA Audit

## Summary
Most "Get Quote" CTAs are properly using the modal. Here's the breakdown:

## ✅ Already Using Modal (Good)

### 1. **CityPageClient** (`/[state]/[city]/page`)
- All quote buttons use `handleQuoteClick()` which opens modal
- Locations: Hero section, size cards, provider cards, sidebar

### 2. **Business Page** (`/[state]/[city]/[business]/page`)
- "Get Free Quote" button opens modal with business pre-selected
- Line 223: `setShowQuoteModal(true)`

### 3. **HomePageClient** 
- Main quote form is inline (intentional - it's the homepage)
- Line 499: Direct form, not a button

### 4. **Homeowners Page**
- All CTAs use `setQuoteModalOpen(true)`
- Lines 204, 406, 662

### 5. **Commercial Page**
- All CTAs use `setQuoteModalOpen(true)`
- Lines 152, 234, 365, 441, 467

### 6. **Dashboard**
- "Request New Quote" uses modal
- Lines 246, 265: `setQuoteModalOpen(true)`

### 7. **Map Components**
- GoogleMap: Uses `window.handleMarkerQuote` → calls `onProviderSelect`
- LocationMap: Properly wired to open modal

### 8. **BusinessDirectory**
- `handleGetQuotes()` function opens modal
- Lines 397, 489, 549

## ⚠️ Links to Check/Discuss

### 1. **Footer Component**
- Line 130: `<Link href="/">Get a Quote</Link>`
- **Current**: Links to homepage
- **Question**: Should this open modal directly or go to homepage?
- **Recommendation**: Keep as-is (homepage is fine for footer)

### 2. **Services Page** (`/services/[service]/page`)
- Line 670: `onClick={handleGetQuotes}`
- Need to verify this opens modal

### 3. **State Page** (`/[state]/page`)
- Has inline form similar to homepage
- **Question**: Should state pages have inline form or use modal?

## 📝 Recommendations

### Option 1: Keep Current Behavior
- Footer → Homepage (good for SEO)
- State pages → Inline form (good for conversions)
- Everything else → Modal

### Option 2: Universal Modal
- Add a global "Get Quote" button that opens modal from anywhere
- Could be triggered by URL parameter: `?quote=true`
- Footer could link to `/?quote=true` to auto-open modal

### Option 3: Smart Detection
- If user is already on a page with providers → Open modal
- If user is on info page (about, how-it-works) → Go to homepage
- If user is on homepage → Scroll to form

## Next Steps

1. **Decide on footer behavior** - Keep linking to homepage or open modal?
2. **Standardize state pages** - Inline form or modal?
3. **Add tracking** - Track which CTAs convert better (modal vs inline form)

## Code Patterns

### Correct Modal Usage
```tsx
// Good - Opens modal
<button onClick={() => setQuoteModalOpen(true)}>
  Get Quote
</button>
```

### Inline Form (Homepage)
```tsx
// Also good - Direct form on landing pages
<form onSubmit={handleQuoteSubmit}>
  {/* Form fields */}
</form>
```

### Navigation Pattern
```tsx
// Acceptable - Navigate to page with form
<Link href="/">Get a Quote</Link>
```