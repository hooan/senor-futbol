-- =====================================================
-- ADMIN USER PROMOTION
-- Replace email with your registered email
-- =====================================================

-- Option A: Promote by email
UPDATE users 
SET is_admin = true 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'YOUR_EMAIL_HERE@example.com'
);

-- Option B: Promote by username
-- UPDATE users SET is_admin = true WHERE username = 'YOUR_USERNAME';

-- Option C: Promote most recent user
-- UPDATE users SET is_admin = true WHERE id = (SELECT id FROM users ORDER BY created_at DESC LIMIT 1);

-- Verify admin created
SELECT 
  u.id,
  u.username,
  u.is_admin,
  au.email,
  u.created_at
FROM users u
JOIN auth.users au ON au.id = u.id
WHERE u.is_admin = true;

DO $$ 
DECLARE
  admin_count INTEGER;
BEGIN 
  SELECT COUNT(*) INTO admin_count FROM users WHERE is_admin = true;
  RAISE NOTICE 'Admin users found: %', admin_count;
END $$;
