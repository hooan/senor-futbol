# 🔧 Fix: User Registration RLS Error

## Problem
"new row violates row-level security policy for table 'users'"

## Solution
Database trigger automatically creates user profiles when auth users register.

---

## Implementation Steps

### 1. Run SQL Scripts (Supabase SQL Editor)

**Script 1: Trigger (Primary Fix)**
File: `fix-user-registration-trigger.sql`
- Creates automatic user profile creation
- Handles username conflicts
- Bypasses RLS with SECURITY DEFINER

**Script 2: Policy (Backup)**
File: `fix-user-registration-policy.sql`
- Adds INSERT policy as safety net
- Allows manual inserts if trigger fails

### 2. Update Application Code

**File:** `src/contexts/AuthContext.tsx`

**Line 41-72, replace signUp function with:**

```typescript
const signUp = async (email: string, password: string, username: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (error) return { error }

    // Profile automatically created by database trigger
    
    return { error: null }
  } catch (error) {
    return { error }
  }
}
```

**Changes:** Remove lines 55-66 (manual insert to users table)

### 3. Test Locally

```bash
cd /home/hooan/Projects/kira/senor-futbol
pnpm dev
```

Visit: http://localhost:3000/register
- Register new account
- Should succeed without RLS errors
- Check Supabase → Table Editor → users (profile created automatically)

### 4. Deploy to Production

```bash
git add .
git commit -m "Fix: Use database trigger for user registration"
vercel --prod
```

### 5. Create Admin User

**In Supabase SQL Editor:**
File: `create-admin-user.sql`
- Replace `YOUR_EMAIL_HERE@example.com` with your email
- Run query
- Verify admin created (shows in query results)

### 6. Test Admin Access

Visit: https://senor-futbol.vercel.app/admin
- Should load admin dashboard
- Create test news article
- Verify it works

---

## Rollback (If Needed)

**File:** `rollback-trigger.sql`

1. Run rollback SQL script
2. Restore lines 55-66 in AuthContext.tsx
3. Redeploy

---

## Verification

### Database:
```sql
-- Check trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check function exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- Check policy exists
SELECT * FROM pg_policies WHERE tablename = 'users' AND cmd = 'INSERT';
```

### Application:
- [ ] Registration succeeds
- [ ] Profile created in users table
- [ ] Username correct
- [ ] No RLS errors
- [ ] Login works
- [ ] Profile page loads

### Admin:
- [ ] /admin accessible
- [ ] Dashboard loads
- [ ] Can create news
- [ ] Can view users

---

## Files Created

1. `fix-user-registration-trigger.sql` - Main fix
2. `fix-user-registration-policy.sql` - Backup policy
3. `create-admin-user.sql` - Admin promotion
4. `rollback-trigger.sql` - Rollback script
5. `IMPLEMENTATION_GUIDE.md` - This guide

---

## Summary

**Before:** Manual insert fails due to missing RLS INSERT policy
**After:** Database trigger automatically creates profiles, bypassing RLS
**Backup:** INSERT policy allows manual creation if needed
**Result:** Seamless registration without errors

**Estimated time:** 15 minutes total
