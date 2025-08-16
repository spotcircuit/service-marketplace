# Style Guide & Theme Documentation

## 🎨 Color System

### Brand Colors
| Color | Hex | RGB | CSS Variable | Usage |
|-------|-----|-----|--------------|-------|
| **Primary (Orange)** | #FF8C00 | rgb(255, 140, 0) | `--primary` | Main CTAs, active states, energy |
| **Secondary (Navy)** | #2C3E50 | rgb(44, 62, 80) | `--secondary` | Headers, professional content, trust |
| **Accent (Green)** | #8BC34A | rgb(139, 195, 74) | `--accent` | Success, availability, eco-friendly |

### Neutral Colors
| Color | CSS Variable | Usage |
|-------|--------------|-------|
| Background | `--background` | Main page background (white) |
| Foreground | `--foreground` | Main text color (dark gray) |
| Muted | `--muted` | Disabled states, subtle backgrounds |
| Border | `--border` | Default borders |

## 📦 Utility Classes

### Hero Sections
```html
<!-- Primary Orange Hero -->
<section className="hero-gradient-primary text-white">

<!-- Professional Navy Hero -->
<section className="hero-gradient-secondary text-white">

<!-- Success/Eco Green Hero -->
<section className="hero-gradient-accent text-white">

<!-- Mixed Gradient (CTA sections) -->
<section className="hero-gradient-mixed text-white">
```

### Buttons
```html
<!-- Primary Actions -->
<button className="btn-primary px-6 py-3 rounded-lg">
  Get Quote
</button>

<!-- Secondary Actions -->
<button className="btn-secondary px-6 py-3 rounded-lg">
  Learn More
</button>

<!-- Success Actions -->
<button className="btn-accent px-6 py-3 rounded-lg">
  Claim Business
</button>

<!-- Ghost Buttons -->
<button className="btn-ghost-primary px-6 py-3 rounded-lg">
  Call Now
</button>

<button className="btn-ghost-secondary px-6 py-3 rounded-lg">
  View Details
</button>
```

### Badges
```html
<!-- Popular/Featured -->
<span className="badge-popular">MOST POPULAR</span>

<!-- Commercial/Professional -->
<span className="badge-commercial">COMMERCIAL</span>

<!-- Success/Available -->
<span className="badge-success">VERIFIED</span>
<span className="badge-available">Available Now</span>
```

### Cards
```html
<!-- Featured Card -->
<div className="card-featured rounded-lg p-6">
  Featured content
</div>

<!-- Hoverable Card -->
<div className="card-hover rounded-lg p-6 border">
  Interactive content
</div>
```

### Form Elements
```html
<!-- Text Input -->
<input className="input-primary px-4 py-2 rounded-lg w-full" />

<!-- Select Dropdown -->
<select className="select-primary px-4 py-2 rounded-lg w-full">
  <option>Choose...</option>
</select>

<!-- Checkbox -->
<input type="checkbox" className="checkbox-primary" />
```

### Text Styles
```html
<!-- Gradient Text -->
<h1 className="text-gradient">Eye-catching Headline</h1>

<!-- Primary Gradient Text -->
<h2 className="text-gradient-primary">Orange Gradient</h2>

<!-- Secondary Gradient Text -->
<h2 className="text-gradient-secondary">Navy Gradient</h2>
```

### Section Backgrounds
```html
<!-- Light Orange Background -->
<section className="section-primary">

<!-- Light Navy Background -->
<section className="section-secondary">

<!-- Light Green Background -->
<section className="section-accent">
```

### Status Indicators
```html
<!-- Active/Online -->
<span className="status-active">● Online</span>

<!-- Pending/Processing -->
<span className="status-pending">● Processing</span>

<!-- Inactive/Offline -->
<span className="status-inactive">● Offline</span>
```

## 🎯 Component-Specific Patterns

### Homepage
- **Hero**: `hero-gradient-primary` with white text
- **Quote Form**: White background with `btn-primary` CTAs
- **Size Cards**: Use `badge-popular` for most popular, `badge-commercial` for 30/40-yard
- **Provider Cards**: `btn-primary` for quote, `btn-ghost-primary` for call
- **Sections**: Alternate between white and `bg-gray-50`

### State/City Pages
- **Hero**: `hero-gradient-secondary` (navy for authority)
- **City Buttons**: Active state with `bg-primary/10 border-primary text-primary`
- **Map Section**: White background
- **CTAs**: `btn-primary` for all quote buttons

### Business Profile
- **Hero**: `hero-gradient-secondary` with business info
- **Claim Button**: `btn-accent` (green for positive action)
- **Quote Button**: `btn-primary`
- **Verified Badge**: `badge-success`

### Directory/Search
- **Filters**: Active with `bg-primary/10 border-primary text-primary`
- **Cards**: `card-hover` with white background
- **Sort Options**: `text-secondary` default, `text-primary` when active
- **Pagination**: `btn-ghost-primary` for pages

### Forms & Modals
- **Input Fields**: `input-primary` for all text inputs
- **Submit Buttons**: `btn-primary`
- **Cancel Buttons**: `btn-ghost-secondary`
- **Success Messages**: `bg-accent/10 text-accent border-accent`
- **Error Messages**: `bg-destructive/10 text-destructive border-destructive`

## 🔄 State Management

### Hover States
- Buttons: Reduce opacity to 90% (`hover:bg-primary/90`)
- Cards: Add shadow and slight lift (`hover:shadow-xl hover:-translate-y-1`)
- Links: Change to primary color (`hover:text-primary`)

### Active States
- Navigation: `text-primary border-b-2 border-primary`
- Filters: `bg-primary/10 border-primary text-primary`
- Tabs: `bg-primary text-white`

### Disabled States
- Buttons: `opacity-50 cursor-not-allowed`
- Inputs: `bg-gray-100 text-gray-500`
- Links: `text-gray-400 pointer-events-none`

## 📱 Responsive Design

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach
```html
<!-- Stack on mobile, side-by-side on desktop -->
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Container Widths
```html
<!-- Standard container -->
<div className="container mx-auto px-4">

<!-- Narrow container for content -->
<div className="max-w-4xl mx-auto px-4">

<!-- Wide container for heroes -->
<div className="max-w-7xl mx-auto px-4">
```

## ✅ Best Practices

### Color Usage Rules
1. **Primary (Orange)**: Always use for main CTAs - never for warnings
2. **Secondary (Navy)**: Use for professional/trust elements - not for fun/casual
3. **Accent (Green)**: Only for success/positive states - not primary actions
4. **60-30-10 Rule**: 60% neutral, 30% secondary color, 10% accent color

### Accessibility
- Maintain WCAG AA contrast ratios
- Orange on white: ✅ 3.5:1
- White on orange: ✅ 5.6:1
- White on navy: ✅ 11.4:1
- White on green: ⚠️ Use `bg-accent/90` for better contrast

### Performance
- Use Tailwind classes over inline styles
- Leverage utility classes to reduce CSS bundle
- Lazy load images and heavy components
- Use `transition-all duration-200` for smooth animations

### Consistency
- All primary CTAs should use `btn-primary`
- All cards should have consistent padding (`p-6`)
- All sections should use `section-padding` for vertical spacing
- All form inputs should use `input-primary` styling

## 🚀 Quick Reference

### Most Used Classes
```css
/* Buttons */
btn-primary
btn-ghost-primary

/* Text */
text-primary
text-secondary
text-accent

/* Backgrounds */
bg-primary
bg-secondary
bg-accent

/* Borders */
border-primary
border-secondary
border-accent

/* Hover */
hover:text-primary
hover:bg-primary/10
hover:border-primary
```

### Common Patterns
```html
<!-- CTA Button -->
<button className="btn-primary px-6 py-3 rounded-lg">
  Get Started
</button>

<!-- Featured Card -->
<div className="bg-white rounded-lg shadow-lg p-6 card-hover">
  <h3 className="text-xl font-bold mb-2">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>

<!-- Section with Container -->
<section className="section-padding bg-gray-50">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold mb-8">Section Title</h2>
    <!-- Content -->
  </div>
</section>
```

## 🔧 Development Tips

1. **Use the utility classes** defined in `globals.css` for consistency
2. **Check the color guide** before adding new colors
3. **Test on mobile first** - our users are 60% mobile
4. **Verify contrast** using Chrome DevTools
5. **Keep it simple** - don't over-style elements

## 📝 Examples

### Complete Hero Section
```jsx
<section className="hero-gradient-primary text-white relative overflow-hidden">
  <div className="container mx-auto px-4 py-16">
    <h1 className="text-5xl font-bold mb-4">
      Main Headline
    </h1>
    <p className="text-xl text-white/90 mb-8">
      Supporting text that explains the value proposition
    </p>
    <div className="flex gap-4">
      <button className="btn-primary px-8 py-3 rounded-lg">
        Get Started
      </button>
      <button className="btn-ghost-primary px-8 py-3 rounded-lg bg-white/10">
        Learn More
      </button>
    </div>
  </div>
</section>
```

### Complete Card Component
```jsx
<div className="bg-white rounded-lg shadow-md p-6 card-hover">
  <div className="flex justify-between items-start mb-4">
    <h3 className="text-xl font-bold">Card Title</h3>
    <span className="badge-popular">POPULAR</span>
  </div>
  <p className="text-muted-foreground mb-6">
    Description of the card content goes here.
  </p>
  <div className="flex gap-3">
    <button className="btn-primary px-4 py-2 rounded text-sm flex-1">
      Primary Action
    </button>
    <button className="btn-ghost-secondary px-4 py-2 rounded text-sm flex-1">
      Secondary
    </button>
  </div>
</div>
```

---

*Last Updated: Current Version*
*Maintained by: Development Team*