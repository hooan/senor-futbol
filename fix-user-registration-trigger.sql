-- =====================================================
-- FIX: User Registration RLS Error
-- Database Trigger Solution
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, username, is_admin, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    false,
    NULL
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    INSERT INTO public.users (id, username, is_admin, avatar_url)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', 'user') || '_' || substr(gen_random_uuid()::text, 1, 8),
      false,
      NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

DO $$ 
BEGIN 
  RAISE NOTICE 'SUCCESS: User registration trigger created!';
END $$;
