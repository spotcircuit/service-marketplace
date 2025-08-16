# Service Marketplace Platform

A fully-featured, niche-agnostic service marketplace platform built with Next.js, TypeScript, and Tailwind CSS. Perfect for creating directories for dumpster rentals, home services, healthcare providers, or any service-based business.

## 🚀 Live Demo

[https://dumpsterdiving.netlify.app](https://dumpsterdiving.netlify.app)

## ✨ Features

### Core Platform
- **Dynamic Niche Configuration** - JSON-based niche system for any service type
- **Data-Driven Architecture** - Everything powered by database with server-side caching
- **Multi-Theme Support** - Customizable themes separate from niche configuration
- **Responsive Design** - Mobile-first, works on all devices
- **SEO Optimized** - Dynamic routes for services, states, and cities

### Business Directory
- **Featured Listings** - Promote businesses with subscription tiers
- **Advanced Search** - Filter by category, location, rating, and verification status
- **Business Profiles** - Detailed pages with services, hours, and contact info
- **Ratings & Reviews** - Build trust with customer feedback
- **Location-Based Pages** - SEO-optimized state and city pages

### Lead Generation
- **Quote Request System** - Store quotes in database linking customers to pros
- **Multi-Business Quotes** - Request quotes from multiple providers
- **Lead Management Dashboard** - Track and respond to leads
- **Business Response Tracking** - Monitor quote responses and conversions

### Business Management
- **Business Setup Flow** - Address verification before account creation
- **Claim Existing Businesses** - Match and claim unclaimed listings
- **Dealer Portal** - Complete business management dashboard
- **Subscription Plans** - Free, Professional ($99), Premium ($299) tiers
- **Advertising System** - Featured listings and territory exclusivity

### User Management
- **Multi-Role Authentication** - Customer, Business Owner, Admin roles
- **Profile Management** - Edit profile and change password for all user types
- **Dashboard Access** - Role-specific dashboards always visible in header
- **Demo Users** - Built-in demo accounts when database not configured

### Payment Integration
- **Stripe Subscriptions** - Complete subscription management
- **Database-Configured Stripe** - Store Stripe keys in database
- **Test Mode Support** - Built-in test page at /test-stripe
- **Subscription Management** - Upgrade, downgrade, cancel subscriptions

### Data Integration
- **Neon PostgreSQL** - Primary database with Row Level Security
- **Server-Side Caching** - BusinessCache loads all data on startup
- **Auto Cache Refresh** - Rebuilds cache when data changes
- **Fallback Mode** - Works without database using demo data

## 🛠️ Tech Stack

- **Framework:** Next.js 15.4 with Turbopack
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Neon PostgreSQL
- **Authentication:** JWT with bcrypt
- **Payments:** Stripe API
- **Deployment:** Vercel/Netlify
- **Package Manager:** npm/bun

## 📦 Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/service-marketplace.git
cd service-marketplace
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Authentication
JWT_SECRET=your-secret-key-change-in-production

# Google Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Stripe (Optional - can be configured in admin)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

4. **Set up the database:**
```bash
# Run the schema files in order:
database/schema.sql
database/create-business-subscriptions.sql
database/create-quotes-table.sql
```

5. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🔑 Demo Accounts

When database is not configured, use these demo accounts:

- **Admin:** admin@example.com / admin123
- **Business Owner:** dealer@example.com / dealer123
- **Customer:** customer@example.com / customer123

## 🎨 Niche Configuration

The platform uses a JSON-based niche configuration system:

1. **Active Niche:** Set in `config/active-niche.json`
2. **Niche Configs:** Stored in `config/niches/[niche-name].json`
3. **Default:** Dumpster rental configuration included

To create a new niche:
1. Copy `config/niches/dumpster-rental.json`
2. Rename and customize for your niche
3. Update `config/active-niche.json`

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API endpoints
│   ├── admin/             # Admin dashboard
│   ├── dealer-portal/     # Business owner portal
│   ├── dashboard/         # Customer dashboard
│   ├── business-setup/    # Business registration flow
│   ├── services/[service] # SEO service pages
│   └── [state]/[city]     # Location-based pages
├── components/            # React components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
│   ├── auth.ts           # Authentication
│   ├── cache.ts          # Server-side cache
│   ├── neon.ts           # Database connection
│   ├── stripe.ts         # Payment processing
│   └── niche-config.ts   # Niche configuration
└── config/               # Configuration files
    ├── active-niche.json
    └── niches/           # Niche configurations
```

## 🚀 Deployment

### Vercel
```bash
vercel
```

### Netlify
```bash
netlify deploy --prod
```

### Docker
```bash
docker build -t service-marketplace .
docker run -p 3000:3000 service-marketplace
```

## 📊 Features Roadmap

- [ ] Google Places API integration
- [ ] Email notifications (SendGrid)
- [ ] SMS notifications (Twilio)
- [ ] Advanced analytics dashboard
- [ ] Review system with moderation
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] AI-powered lead matching

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For support, email support@yourplatform.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Database by [Neon](https://neon.tech)
- Payments by [Stripe](https://stripe.com)