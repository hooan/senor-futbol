# Supabase Setup Guide

This guide will help you set up Supabase for the Señor Fútbol application.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (or email)
4. Click "New Project"
5. Fill in the details:
   - **Name**: senor-futbol (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is perfect for this project
6. Click "Create new project"
7. Wait 2-3 minutes for the project to be set up

## Step 2: Get Your API Credentials

1. Once the project is ready, go to **Settings** (gear icon in sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)
4. Keep this tab open - you'll need these values next

## Step 3: Configure Environment Variables

1. In your project folder, open `.env.local`
2. Replace the empty values with your credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Save the file

## Step 4: Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (in the left sidebar)
2. Click "New query"
3. Open the file `supabase-schema.sql` in your project
4. Copy ALL the contents (it's a large file with ~400 lines)
5. Paste it into the SQL Editor
6. Click "Run" (or press Ctrl+Enter)
7. You should see: "Success. No rows returned"

This will create:
- ✅ 9 database tables (teams, fixtures, standings, users, news, quinielas, etc.)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Functions for calculating quiniela points
- ✅ Triggers for timestamps

## Step 5: Verify Database Setup

1. Go to **Table Editor** (in the left sidebar)
2. You should see these tables:
   - teams
   - fixtures
   - standings
   - users
   - news
   - quinielas
   - quiniela_predictions
   - quiniela_participants
   - api_request_log

If you see all these tables, you're all set! ✅

## Step 6: Setup Authentication (Optional - for later)

When you're ready to add user authentication:

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider (already enabled by default)
3. Optional: Enable social providers:
   - Google OAuth (recommended)
   - GitHub OAuth
   - Others as needed

### Email Configuration (Important for Production)

For development, emails will show in the **Authentication** > **Logs** section.

For production:
1. Go to **Authentication** > **Email Templates**
2. Configure your SMTP settings or use Supabase's built-in email service

## Step 7: Setup Storage (For News Images)

When you need to upload news images:

1. Go to **Storage** (in the left sidebar)
2. Click "Create a new bucket"
3. Name it: `news-images`
4. Make it **Public** (so images can be accessed)
5. Click "Create bucket"

### Storage Policies

Add these policies to allow uploads:

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'news-images');

-- Allow everyone to view images
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'news-images');
```

## Step 8: Create First Admin User

After you've registered your first user account:

1. Go to **SQL Editor**
2. Run this query (replace with your email):
   ```sql
   -- Find your user ID
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   
   -- Make yourself an admin
   UPDATE users 
   SET is_admin = true 
   WHERE id = 'your-user-id-from-above';
   ```

## Troubleshooting

### "Supabase credentials not found" warning

- Check that `.env.local` has the correct values
- Make sure the file is in the root directory
- Restart the dev server: `pnpm dev`

### SQL Schema Errors

If you get errors running the schema:
1. Make sure you copied the ENTIRE file
2. Try running it in sections (tables first, then policies, then functions)
3. Check that the UUID extension is enabled (it should be by default)

### Can't see tables in Table Editor

- Refresh the page
- Check SQL Editor for any error messages
- Make sure the schema ran successfully

### Authentication not working

- Check that Email provider is enabled
- For social auth, make sure you've configured OAuth apps
- Check Authentication > Logs for error messages

## Next Steps

After completing this setup:

1. Restart your dev server: `pnpm dev`
2. The app will now connect to Supabase
3. You can start building features!

## API Rate Limits (Free Tier)

Supabase Free Tier includes:
- 500 MB database space (more than enough for this project)
- 50,000 monthly active users
- 2 GB bandwidth
- 1 GB file storage

This is perfect for development and small-scale production use!

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

Need help? Check the Supabase Discord or GitHub issues.
