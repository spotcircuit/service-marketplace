# Neon Database Setup Guide

This guide will help you connect your service marketplace to Neon for high-performance PostgreSQL database hosting.

## Why Neon?

- **Serverless PostgreSQL**: Auto-scaling compute with instant startup
- **Branching**: Create database branches for development and testing
- **Modern Developer Experience**: Built for modern cloud applications
- **Cost Effective**: Pay only for what you use with generous free tier

## Prerequisites

- A Neon account (free tier available at [neon.tech](https://neon.tech))
- Your deployed or local service marketplace
- Node.js 18+ installed

## Step 1: Create a Neon Project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Click "Create a project"
3. Configure your project:
   - **Project name**: `service-marketplace` (or your preferred name)
   - **Region**: Select the closest to your users
   - **PostgreSQL version**: 16 (recommended)
4. Click "Create project"

## Step 2: Set Up Database Tables

### Option A: Using Neon Console

1. In your Neon dashboard, click on your project
2. Go to the **SQL Editor** tab
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" to execute the SQL
5. (Optional) Run `database/seed.sql` to add sample data

### Option B: Using Neon CLI

```bash
# Install Neon CLI
npm install -g @neondatabase/cli

# Authenticate
neon auth

# Run schema
neon sql --file=database/schema.sql

# Run seed data (optional)
neon sql --file=database/seed.sql
```

## Step 3: Get Your Connection String

1. In your Neon console, go to **Dashboard**
2. Find your connection string (it looks like):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb
   ```
3. Copy the **Pooled connection** string for production use

## Step 4: Configure Your Application

### Environment Variables

Create or update your `.env.local` file:

```env
# Neon Database
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
DIRECT_DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech:5432/neondb?sslmode=require

# For compatibility with existing Supabase setup
NEXT_PUBLIC_DATABASE_TYPE=neon
NEXT_PUBLIC_NEON_DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### For Production (Netlify)

1. Go to your Netlify dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add these environment variables:
   - `DATABASE_URL` - Your pooled connection string
   - `DIRECT_DATABASE_URL` - Your direct connection string
   - `NEXT_PUBLIC_DATABASE_TYPE` - Set to `neon`

## Step 5: Install Database Client

```bash
# Install Neon serverless driver
bun add @neondatabase/serverless

# Install Prisma (optional, for ORM)
bun add -D prisma @prisma/client
```

## Step 6: Database Branching (Development)

Neon's branching feature allows you to create isolated database copies:

```bash
# Create a development branch
neon branches create --name dev

# List branches
neon branches list

# Switch to a branch
neon connection-string --branch dev
```

## Migration from Supabase

If you're migrating from Supabase:

1. **Export data from Supabase**:
   ```bash
   pg_dump YOUR_SUPABASE_URL > backup.sql
   ```

2. **Import to Neon**:
   ```bash
   neon sql --file=backup.sql
   ```

3. **Update your application code** to use the new Neon client (see `src/lib/neon.ts`)

## Database Schema

The marketplace uses these main tables:

- **businesses**: Service provider listings
- **leads**: Customer inquiries and quotes
- **users**: User accounts (when auth is enabled)
- **reviews**: Customer reviews and ratings

## Performance Optimization

### Connection Pooling

Neon provides built-in connection pooling. Use the pooled connection string for:
- Serverless functions
- High-traffic applications
- Short-lived connections

### Caching

Consider implementing caching for frequently accessed data:
- Business listings
- Categories
- Static configuration

## Monitoring

1. **Neon Console**: Monitor queries, performance, and usage
2. **Custom Monitoring**: Implement application-level monitoring
3. **Alerts**: Set up alerts for slow queries or high usage

## Troubleshooting

### Connection Issues

- Ensure SSL mode is set to `require`
- Check if your IP is allowed (for direct connections)
- Verify connection string format

### Performance Issues

- Use connection pooling for serverless
- Implement query optimization
- Consider adding indexes for frequently queried columns

### Migration Issues

- Check data types compatibility
- Verify foreign key constraints
- Test in a branch before production

## Security Best Practices

1. **Never commit credentials**: Use environment variables
2. **Use connection pooling**: For serverless environments
3. **Enable SSL**: Always use `sslmode=require`
4. **Implement RLS**: Use Row Level Security for multi-tenant apps
5. **Regular backups**: Neon provides automatic backups

## Next Steps

1. **Set up authentication**: Implement user authentication
2. **Configure branching**: Set up dev/staging branches
3. **Optimize queries**: Add indexes for better performance
4. **Enable monitoring**: Set up performance monitoring

## Support

- Neon Documentation: [neon.tech/docs](https://neon.tech/docs)
- Community Discord: [discord.gg/neon](https://discord.gg/neon)
- GitHub: [github.com/neondatabase](https://github.com/neondatabase)
