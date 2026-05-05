-- Set search path for security definer function
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- Revoke execute from public/anon/authenticated roles for security definer functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Only service_role (used by auth trigger) should execute it
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;