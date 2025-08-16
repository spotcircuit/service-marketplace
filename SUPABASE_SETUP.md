# Supabase Setup Guide

This guide will help you connect your service marketplace to Supabase for persistent data storage.

## Prerequisites

- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- Your deployed or local service marketplace

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `service-marketplace` (or your preferred name)
   - Database password: Choose a strong password
   - Region: Select the closest to your users
4. Click "Create Project" and wait for setup to complete

## Step 2: Set Up Database Tables

1. In your Supabase project dashboard, go to the **SQL Editor**
2. Copy and paste the contents of `database/schema.sql`
3. Click "Run" to create the tables
4. (Optional) To add sample data, run the contents of `database/seed.sql`

## Step 3: Get Your API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 4: Configure Your Application

### For Local Development

1. Create a `.env.local` file in your project root:
```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Restart your development server:
```bash
bun dev
```

### For Production (Netlify)

1. Go to your Netlify dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the same environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Trigger a redeploy for changes to take effect

## Step 5: Verify Connection

1. Visit your application
2. Check the browser console for any errors
3. Try creating a quote request to test the lead generation
4. Visit `/admin/leads` to see if leads are being stored

## Database Schema Overview

### `businesses` table
- Stores all business listings
- Includes featured status, verification, ratings
- Supports JSON fields for services, hours, etc.

### `leads` table
- Stores customer inquiries and quote requests
- Tracks lead status (new, contacted, quoted, won, lost)
- Links to businesses via `business_ids` field

## Troubleshooting

### "Database not configured" error
- Ensure your environment variables are set correctly
- Check that the keys start with `NEXT_PUBLIC_`
- Verify the Supabase project is active

### No data showing
- Run the seed.sql file to add sample businesses
- Check Row Level Security (RLS) policies in Supabase
- Ensure the tables were created successfully

### Authentication issues
- The current setup uses public access (anon key)
- For production, implement proper authentication
- Consider enabling RLS policies for security

## Next Steps

1. **Import Real Data**: Use the CSV import feature or API to add real businesses
2. **Set Up Authentication**: Implement Supabase Auth for admin access
3. **Configure Email**: Set up email notifications for new leads
4. **Enable Backups**: Configure regular database backups in Supabase

## Support

- Supabase Documentation: [docs.supabase.com](https://docs.supabase.com)
- Database Schema: See `database/schema.sql`
- Sample Data: See `database/seed.sql`
