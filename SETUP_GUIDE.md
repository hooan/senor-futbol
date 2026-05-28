# Supabase Setup - Quick Start ⚡

## Your Current Status

I can see you have a `.env.local` file with:
- ✅ Supabase URL configured
- ⚠️ Anon key may be incomplete (looks truncated)
- ✅ API Football key ready

---

## Step-by-Step Setup (15-20 minutes)

### 1. Verify Your Supabase Credentials (2 min)

**Go to your Supabase project:**
1. Visit https://supabase.com/dashboard
2. Open your project: `senor-futbol` (or the name you used)
3. Click **Settings** (gear icon) → **API**
4. You'll see:
   ```
   Project URL: https://okesqimsqdqiwpunazrk.supabase.co ✅
   anon public key: eyJhbG... (very long string)
   ```

**Update .env.local with the FULL anon key:**
```env
VITE_SUPABASE_URL=https://okesqimsqdqiwpunazrk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZXNxaW1zcWRxaXdwdW5henJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI1MzE2MDAsImV4cCI6MTk4ODEwNzYwMH0.xxx...
```

⚠️ **Important**: The anon key should be ~200+ characters long!

---

### 2. Run Database Schema (5 min)

**In Supabase Dashboard:**
1. Click **SQL Editor** in left sidebar
2. Click **+ New query**
3. Copy ALL contents from `supabase-schema.sql` in your project
4. Paste into SQL Editor
5. Click **RUN** (or Ctrl+Enter)

**Expected Result:**
```
Success. No rows returned
```

**Verify Tables Created:**
1. Go to **Table Editor** in left sidebar
2. You should see 9 tables:
   - ✅ teams
   - ✅ fixtures
   - ✅ standings
   - ✅ users
   - ✅ news
   - ✅ quinielas
   - ✅ quiniela_predictions
   - ✅ quiniela_participants
   - ✅ api_request_log

If you see all tables → **SUCCESS!** ✅

---

### 3. Test Authentication (3 min)

**Start the dev server:**
```bash
pnpm dev
```

**Test Registration:**
1. Visit http://localhost:5173
2. Click **LOGIN** in header
3. Click **Register** link
4. Fill out:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
5. Click **Register**

**Expected:**
- ✅ Redirected to home page
- ✅ Header shows `@testuser` instead of LOGIN
- ✅ Can click username to see profile

**Check Supabase:**
1. Go to **Authentication** in Supabase dashboard
2. You should see `test@example.com` in users list
3. Go to **Table Editor** → **users** table
4. You should see one row with username `testuser`

---

### 4. Create Admin User (2 min)

**In Supabase SQL Editor:**

Run this SQL to make yourself admin:
```sql
-- Update the test user to be an admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{is_admin}',
  'true'::jsonb
)
WHERE email = 'test@example.com';

-- Verify it worked
SELECT email, raw_user_meta_data->'is_admin' as is_admin 
FROM auth.users 
WHERE email = 'test@example.com';
```

**Expected Result:**
```
email              | is_admin
-------------------|----------
test@example.com   | true
```

---

### 5. Test Admin Panel (2 min)

**In your browser:**
1. Visit http://localhost:5173/admin
2. You should see the **Admin Dashboard**
3. If you see "Access Denied" → Logout and login again
4. Try clicking **Manage News**
5. Try creating a test article

**If it works → Admin panel is ready!** ✅

---

## Quick Test Checklist

Run through these to verify everything works:

### Authentication ✓
- [ ] Can register new user
- [ ] Can login
- [ ] Can view profile
- [ ] Can logout
- [ ] Session persists on refresh

### Quinielas ✓
- [ ] Can browse quinielas (shows mock data)
- [ ] Can create quiniela (as logged-in user)
- [ ] Can join quiniela as guest
- [ ] Can make predictions
- [ ] Can view leaderboard

### Admin Panel ✓
- [ ] Can access /admin (with admin user)
- [ ] Can view news list
- [ ] Can create news article
- [ ] Can edit news article
- [ ] Can delete news article
- [ ] Can view users

### Polish Features ✓
- [ ] Toast notifications appear
- [ ] Copy button works
- [ ] Share buttons work
- [ ] Error boundary catches errors

---

## Troubleshooting

### "Invalid API key" Error
- Check that anon key is complete (200+ chars)
- Make sure there are no spaces or line breaks
- Restart dev server after changing .env.local

### "Table does not exist" Error
- Run the SQL schema again
- Check Table Editor to verify tables exist
- Check for SQL errors in the query result

### "Not authenticated" Error
- Logout and login again
- Clear browser cache
- Check Supabase → Authentication → Users

### "Access Denied" to Admin Panel
- Verify is_admin flag in database
- Logout and login again
- Check browser console for errors

### Can't Register/Login
- Check Supabase → Authentication → Logs
- Verify email provider is enabled
- Check for error messages in console

---

## Production Deployment (Next Step)

Once local testing works:

### 1. Vercel Deployment (10 min)
```bash
# Install Vercel CLI (optional)
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### 2. Configure Domain (5 min)
- Add custom domain in Vercel
- Update CORS in Supabase if needed

### 3. Production Testing (5 min)
- Test authentication
- Test quinielas
- Test admin panel
- Check error handling

---

## Next Steps After Setup

### Add Mock Data (Optional)
If you want to populate with World Cup 2026 data:

```sql
-- Teams will be added when you integrate API-Football
-- Or manually insert from mockTeams.ts

-- News articles
INSERT INTO news (title, content, excerpt, author_id, is_published, published_at)
VALUES 
  ('First Article', 'Content here...', 'Excerpt...', 'your-user-id', true, now());
```

### Connect API-Football (Later)
1. Get API key from api-football.com
2. Update services to fetch real data
3. Cache in Supabase
4. Set up cron job for updates

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase → Logs
3. Review error messages carefully
4. Verify all environment variables

---

**Your Setup Progress:**
- [x] Supabase project created
- [ ] Database schema loaded
- [ ] Authentication tested
- [ ] Admin user created
- [ ] Admin panel tested
- [ ] Ready for deployment!

**Estimated Time Remaining:** ~15 minutes

Let me know when you complete each step and I can help troubleshoot!
