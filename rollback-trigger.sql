-- =====================================================
-- ROLLBACK: Remove trigger and restore manual insert
-- =====================================================

-- Remove trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Keep INSERT policy active
-- (already created by fix-user-registration-policy.sql)

-- Restore manual insert in src/contexts/AuthContext.tsx:
-- Uncomment lines 55-66 in signUp function

DO $$ 
BEGIN 
  RAISE NOTICE 'ROLLBACK COMPLETE: Trigger removed, manual insert required in app code';
END $$;
