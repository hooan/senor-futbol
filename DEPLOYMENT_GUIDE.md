# Deployment Guide - Vercel

Complete guide to deploy Señor Fútbol to production.

---

## Prerequisites

✅ Supabase project set up (see SETUP_GUIDE.md)
✅ Database schema loaded
✅ Authentication tested locally
✅ Environment variables configured

---

## Method 1: Deploy with Vercel CLI (Recommended)

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```
- Choose your preferred login method (GitHub, email, etc.)

### Step 3: Deploy
```bash
cd /home/hooan/Projects/kira/senor-futbol
vercel
```

**Follow the prompts:**
```
? Set up and deploy "~/Projects/kira/senor-futbol"? [Y/n] y
? Which scope do you want to deploy to? <your-name>
? Link to existing project? [y/N] n
? What's your project's name? senor-futbol
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

**Vercel will:**
- Detect Vite configuration automatically
- Build the project (`pnpm build`)
- Deploy to production
- Give you a URL: `https://senor-futbol-xxx.vercel.app`

### Step 4: Add Environment Variables

**In Vercel Dashboard:**
1. Go to your project: https://vercel.com/dashboard
2. Click your project: `senor-futbol`
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
Name: VITE_SUPABASE_URL
Value: https://okesqimsqdqiwpunazrk.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: [your full anon key from Supabase]

Name: VITE_API_FOOTBALL_KEY
Value: 28e2ded278d9d2898c858b57e18e32b4
```

5. Click **Save** for each

### Step 5: Redeploy
```bash
vercel --prod
```

Or in Vercel Dashboard:
- Go to **Deployments**
- Click **Redeploy** on the latest deployment

---

## Method 2: Deploy with GitHub (Easier)

### Step 1: Push to GitHub
```bash
cd /home/hooan/Projects/kira/senor-futbol

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - World Cup 2026 app"

# Create GitHub repo and push
git remote add origin https://github.com/your-username/senor-futbol.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub account
4. Find `senor-futbol` repository
5. Click **Import**

**Configure Project:**
- Framework Preset: **Vite** (auto-detected)
- Root Directory: `./`
- Build Command: `pnpm build` (auto)
- Output Directory: `dist` (auto)

### Step 3: Add Environment Variables
Same as Method 1, Step 4

### Step 4: Deploy
Click **Deploy** button

---

## Post-Deployment Setup

### 1. Configure Supabase CORS

**In Supabase Dashboard:**
1. Go to **Settings** → **API**
2. Scroll to **CORS Configuration**
3. Add your Vercel domain:
   ```
   https://senor-futbol-xxx.vercel.app
   ```
4. Save

### 2. Test Production Site

Visit your Vercel URL and test:

**Authentication:**
- [ ] Register new account
- [ ] Login
- [ ] View profile
- [ ] Logout

**Quinielas:**
- [ ] Browse quinielas
- [ ] Create quiniela (logged in)
- [ ] Join as guest
- [ ] Make predictions

**Admin Panel:**
- [ ] Login with admin account
- [ ] Access /admin
- [ ] Create news article
- [ ] View users

**Polish Features:**
- [ ] Toasts appear
- [ ] Copy button works
- [ ] Share buttons work

### 3. Setup Custom Domain (Optional)

**In Vercel Dashboard:**
1. Go to **Settings** → **Domains**
2. Add your domain: `senorfutbol.com`
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-60 min)

**Update Supabase CORS:**
Add your custom domain to allowed origins.

---

## Environment Variables Reference

### Required Variables
```env
VITE_SUPABASE_URL=https://okesqimsqdqiwpunazrk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG... (full key)
```

### Optional Variables
```env
VITE_API_FOOTBALL_KEY=28e2ded278d9d2898c858b57e18e32b4
```

⚠️ **Never commit `.env.local` to git!**
It's already in `.gitignore`.

---

## Vercel Configuration

The app uses these Vercel settings (auto-detected):

**`vercel.json` (optional):**
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "vite",
  "outputDirectory": "dist"
}
```

---

## Continuous Deployment

**With GitHub integration:**
- Every push to `main` branch → Auto-deploys
- Pull requests → Preview deployments
- Easy rollback from dashboard

**Manual deployment:**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Monitoring & Analytics

### 1. Vercel Analytics (Built-in)
- Go to your project → **Analytics**
- See page views, performance, etc.
- Free tier: 100k events/month

### 2. Supabase Dashboard
- Monitor database usage
- Check authentication logs
- View API requests
- Track storage usage

### 3. Error Tracking
Your app has ErrorBoundary, but for production:
- Consider Sentry integration
- Check browser console logs
- Monitor Vercel function logs

---

## Performance Optimization

### Already Optimized ✅
- Vite build optimization
- React Query caching
- Lazy loading ready
- Image optimization (when using)
- Bundle size: 180 KB gzipped

### Further Optimization (Optional)
```bash
# Analyze bundle
pnpm build
npx vite-bundle-analyzer

# Code splitting
# Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
```

---

## Troubleshooting

### Build Fails on Vercel
```bash
# Test build locally
pnpm build

# Check for errors
# Fix TypeScript errors
# Fix missing dependencies
```

### Environment Variables Not Working
- Check spelling (VITE_ prefix required)
- Redeploy after adding variables
- Check browser console for errors

### Supabase Connection Issues
- Verify URL and anon key
- Check CORS configuration
- Test locally first

### 404 Errors
- Vercel auto-handles SPA routing
- If issues, add `vercel.json`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## Security Checklist

### Before Going Live
- [ ] Environment variables in Vercel (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] Supabase RLS policies enabled
- [ ] Admin routes protected
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Secure passwords for admin accounts
- [ ] Regular Supabase backups enabled

---

## Maintenance

### Regular Tasks
- Monitor Supabase usage (stay within free tier)
- Update dependencies monthly: `pnpm update`
- Check for security updates
- Backup database regularly
- Review error logs

### Supabase Free Tier Limits
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth/month
- 50k monthly active users
- 100k API requests/day

For World Cup 2026, this should be sufficient for hundreds of users!

---

## Scaling (If Needed)

### When to Upgrade
- Approaching free tier limits
- Need more database space
- Need higher API rate limits
- Need better performance

### Vercel Pro ($20/month)
- Custom domains with SSL
- Advanced analytics
- Higher limits

### Supabase Pro ($25/month)
- 8 GB database
- 100 GB bandwidth
- Daily backups
- Email support

---

## Post-Launch Checklist

### Week 1
- [ ] Monitor performance
- [ ] Fix any bugs reported
- [ ] Check analytics
- [ ] Verify all features work
- [ ] Get user feedback

### Month 1
- [ ] Review Supabase usage
- [ ] Optimize slow queries
- [ ] Add requested features
- [ ] Update content regularly

---

## Success Metrics

### Key Metrics to Track
- User registrations
- Quinielas created
- Predictions made
- Page views
- Bounce rate
- Error rate

### Goals
- 50+ users first week
- 100+ quinielas created before World Cup
- < 1% error rate
- < 2s page load time

---

## Next Steps

After deployment:
1. Share the URL!
2. Create sample quinielas
3. Write admin news articles
4. Promote on social media
5. Gather feedback
6. Iterate and improve

---

## Deployment Checklist

### Pre-Deployment
- [x] Supabase configured
- [x] Database schema loaded
- [x] Local testing complete
- [x] Environment variables ready
- [x] Build succeeds locally

### Deployment
- [ ] Push to GitHub (optional)
- [ ] Deploy to Vercel
- [ ] Add environment variables
- [ ] Configure Supabase CORS
- [ ] Test production site

### Post-Deployment
- [ ] Create admin account
- [ ] Add sample content
- [ ] Test all features
- [ ] Monitor for errors
- [ ] Share with users!

---

**Estimated Time:** 30 minutes to 1 hour
**Difficulty:** Easy (Vercel handles everything!)

**Your app is ready to launch!** 🚀

Need help with deployment? Let me know at what step you are!
