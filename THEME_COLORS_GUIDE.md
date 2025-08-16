# Theme Color Usage Guide

## Color Palette
- **Primary (Orange)**: `rgb(255, 140, 0)` - #FF8C00
- **Secondary (Navy Blue)**: `rgb(44, 62, 80)` - #2C3E50  
- **Accent (Lime Green)**: `rgb(139, 195, 74)` - #8BC34A

## Color Usage Rules

### Primary Color (Orange) - Action & Energy
**When to use:**
- Main CTAs (Get Quote, Submit, Book Now)
- Active/selected states
- Important highlights
- Progress indicators
- Hero gradients (primary to primary/80)
- Hover states for secondary buttons

**Where:**
- Primary buttons: `bg-primary text-white`
- Hover states: `hover:bg-primary/90`
- Active nav items: `text-primary border-primary`
- Links on hover: `hover:text-primary`
- Focus rings: `focus:ring-primary`

### Secondary Color (Navy Blue) - Trust & Stability
**When to use:**
- Headers and footers
- Navigation backgrounds
- Secondary information sections
- Professional/business content
- Text on light backgrounds

**Where:**
- Footer: `bg-secondary text-white`
- Headers: `bg-secondary` or gradients
- Secondary buttons: `bg-secondary text-white`
- Cards headers: `bg-secondary/10`
- Professional badges: `bg-secondary/20 text-secondary`

### Accent Color (Lime Green) - Success & Growth
**When to use:**
- Success messages
- Positive feedback
- Environmental/eco-friendly features
- Availability indicators
- Special offers/promotions

**Where:**
- Success alerts: `bg-accent/10 text-accent`
- Available now badges: `bg-accent text-white`
- Checkmarks/success icons: `text-accent`
- Special offer banners: `bg-accent/20 border-accent`
- "Verified" badges: `bg-accent/10 text-accent`

## Component-Specific Usage

### Hero Sections
```css
/* Primary gradient hero */
bg-gradient-to-br from-primary to-primary/80

/* Secondary gradient hero */
bg-gradient-to-br from-secondary to-secondary/80

/* Mixed gradient (call-to-action) */
bg-gradient-to-r from-primary to-accent
```

### Buttons
```css
/* Primary CTA */
bg-primary text-white hover:bg-primary/90

/* Secondary CTA */
bg-secondary text-white hover:bg-secondary/90

/* Success/Eco */
bg-accent text-white hover:bg-accent/90

/* Ghost Primary */
border-primary text-primary hover:bg-primary/10

/* Ghost Secondary */
border-secondary text-secondary hover:bg-secondary/10
```

### Cards & Sections
```css
/* White sections */
bg-white

/* Gray sections (alternating) */
bg-gray-50

/* Featured cards */
border-primary shadow-lg ring-2 ring-primary/20

/* Success cards */
bg-accent/5 border-accent

/* Professional cards */
bg-secondary/5 border-secondary
```

### Status Indicators
```css
/* Available/Online */
text-accent or bg-accent

/* Featured/Popular */
bg-primary text-white

/* Professional/Verified */
bg-secondary text-white

/* Urgent/Limited */
bg-primary animate-pulse
```

## Page-Specific Implementations

### Homepage
- Hero: Orange gradient (`from-primary to-primary/80`)
- Quote form: White with orange primary buttons
- Size cards: Orange border for popular, blue badge for commercial
- Provider cards: Orange primary CTA, navy secondary info

### State/City Pages
- Hero: Navy gradient (`from-secondary to-secondary/80`)
- City buttons: Orange when selected
- Map markers: Orange primary
- CTAs: Orange primary

### Business Profile
- Hero: Navy background
- Claim button: Green accent
- Quote button: Orange primary
- Verified badge: Green accent

### Directory
- Filters: Orange active states
- Cards: White with orange CTAs
- Sort options: Navy text, orange when active

## Consistency Rules

1. **Never mix warm and cool in same gradient** (no orange to blue)
2. **Orange is always the primary CTA** on any page
3. **Green is only for positive/success states**, not primary actions
4. **Navy for professional/trust elements**, not fun/energetic
5. **White space is your friend** - don't overuse colors
6. **Maintain 60-30-10 rule**: 
   - 60% neutral (white/gray)
   - 30% secondary (navy sections)
   - 10% accent (orange CTAs, green success)

## Accessibility
- Orange on white: ✅ WCAG AA compliant
- White on orange: ✅ WCAG AA compliant  
- White on navy: ✅ WCAG AAA compliant
- White on green: ⚠️ Use accent/90 for better contrast
- Never use orange on green or green on orange