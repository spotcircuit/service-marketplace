# Service Marketplace Platform

A fully-featured, niche-agnostic service marketplace platform built with Next.js, TypeScript, and Tailwind CSS. Perfect for creating directories for dumpster rentals, home services, healthcare providers, or any service-based business.

## 🚀 Live Demo

[https://dumpsterdiving.netlify.app](https://dumpsterdiving.netlify.app)

## ✨ Features

### Core Platform
- **Dynamic Configuration** - Backend-driven config manageable via admin panel
- **Multi-Theme Support** - 8 pre-configured themes with dynamic switching
- **Responsive Design** - Mobile-first, works on all devices
- **SEO Optimized** - Built for search engine visibility

### Business Directory
- **Featured Listings** - Promote businesses to the top of search results
- **Advanced Search** - Filter by category, location, rating, and verification status
- **Business Profiles** - Detailed pages with services, hours, and contact info
- **Ratings & Reviews** - Build trust with customer feedback

### Lead Generation
- **Quote Request System** - Capture and manage customer inquiries
- **Multi-Business Quotes** - Let customers request quotes from multiple providers
- **Lead Management Dashboard** - Track and update lead status
- **Email Notifications** - Alert businesses of new leads (configurable)

### Business Management
- **Claim Listings** - Business owners can claim and verify their listings
- **Verification System** - Multiple verification methods (email, phone, documents)
- **Admin Dashboard** - Comprehensive control panel for platform management
- **Pricing Tiers** - Free, Professional, and Premium subscription levels

### Data Integration
- **Supabase Ready** - Full integration with Supabase for persistent storage
- **API Endpoints** - RESTful APIs for all data operations
- **CSV Import/Export** - Bulk data management capabilities
- **Fallback Mode** - Works with sample data when database isn't configured

## 🛠️ Tech Stack

- **Framework:** Next.js 15.3 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Neon (PostgreSQL) or Supabase - Unified database layer
- **Deployment:** Netlify (supports Vercel, others)
- **Package Manager:** Bun (also works with npm/yarn)

## 📦 Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/service-marketplace.git
cd service-marketplace
```

2. **Install dependencies:**
```bash
bun install
# or npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your database credentials (choose Neon OR Supabase):

**For Neon:**
```env
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
NEXT_PUBLIC_DATABASE_TYPE=neon
```

**For Supabase:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DATABASE_TYPE=supabase
```

4. **Run the development server:**
```bash
bun dev
# or npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🗄️ Database Setup

The platform supports both **Neon** (recommended) and **Supabase** databases through a unified database layer.

### Option 1: Using Neon (Recommended)

1. Create a project at [neon.tech](https://neon.tech)
2. Get your connection string from the Neon console
3. Run the schema from `database/schema.sql`
4. (Optional) Seed with sample data from `database/seed.sql`
5. Add to `.env.local`:
```env
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
NEXT_PUBLIC_DATABASE_TYPE=neon
```

See `NEON_SETUP.md` for detailed instructions.

### Option 2: Using Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the schema from `database/schema.sql`
3. (Optional) Seed with sample data from `database/seed.sql`
4. Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_DATABASE_TYPE=supabase
```

See `SUPABASE_SETUP.md` for detailed instructions.

### Testing Database Connection

After configuration, test your database connection:
```bash
curl http://localhost:3000/api/test-db
```

## 📁 Project Structure

```
service-marketplace-template/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin dashboard
│   │   ├── business/     # Business profiles
│   │   ├── directory/    # Business directory
│   │   └── ...
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── data/            # Sample data
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript types
├── database/            # Database schema and seeds
├── public/             # Static assets
└── ...
```

## 🎨 Customization

### Themes

The platform includes 8 pre-built themes:
- Default (Orange/Green)
- Professional (Navy)
- Modern (Purple/Pink)
- Eco Friendly (Green)
- Luxury (Gold)
- Tech (Purple/Cyan)
- Healthcare (Blue)
- Construction (Orange/Red)

Access the admin panel at `/admin` to switch themes dynamically.

### Configuration

Edit the configuration through:
1. **Admin Panel** - Runtime configuration at `/admin`
2. **Config File** - `src/config/site-config.ts` for defaults
3. **Environment Variables** - For API keys and secrets

### Niches

Pre-configured templates for:
- Dumpster Rental
- Home Services
- Healthcare
- Education & Tutoring
- General Services

## 🚀 Deployment

### Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/service-marketplace)

1. Click the button above or import your repository
2. Add environment variables in Netlify dashboard
3. Deploy!

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/service-marketplace)

### Manual Deployment

```bash
# Build for production
bun run build

# Start production server
bun run start
```

## 📊 API Documentation

### Businesses

- `GET /api/businesses` - List businesses with filters
- `GET /api/businesses/[id]` - Get single business
- `POST /api/businesses` - Create business (admin)
- `PATCH /api/businesses/[id]` - Update business

### Leads

- `GET /api/leads` - List leads (admin)
- `POST /api/leads` - Create quote request
- `PATCH /api/leads` - Update lead status

### Configuration

- `GET /api/config` - Get site configuration
- `POST /api/config` - Update configuration
- `GET /api/themes` - Get available themes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database by [Supabase](https://supabase.com/) / [Neon](https://neon.tech/)

## 📧 Support

For questions or support, please open an issue on GitHub or contact us at support@example.com

---

**Ready to build your service marketplace?** Get started today!
