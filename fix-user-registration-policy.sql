-- =====================================================
-- BACKUP: RLS INSERT Policy for users table
-- =====================================================

DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

DO $$ 
BEGIN 
  RAISE NOTICE 'SUCCESS: INSERT policy created!';
END $$;
