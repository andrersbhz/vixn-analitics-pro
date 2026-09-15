CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ select exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'admin'); $$;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, service_role;

-- repoint policies to the private helper
DROP POLICY IF EXISTS "Admins can read leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Admins can read leads" ON public.leads FOR SELECT TO authenticated USING (private.is_admin());
CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can read messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON public.contact_messages;
CREATE POLICY "Admins can read messages" ON public.contact_messages FOR SELECT TO authenticated USING (private.is_admin());
CREATE POLICY "Admins can update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY "Admins can delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (private.is_admin());

DROP POLICY IF EXISTS "Admins can manage meetings" ON public.meetings;
CREATE POLICY "Admins can manage meetings" ON public.meetings FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());

DROP FUNCTION IF EXISTS public.is_admin();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC, anon, authenticated;