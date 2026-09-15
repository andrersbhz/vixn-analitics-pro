-- leads: admin-only reads/writes, public insert kept
DROP POLICY IF EXISTS "Authenticated can read leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated can update leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated can delete leads" ON public.leads;
CREATE POLICY "Admins can read leads" ON public.leads FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE TO authenticated USING (public.is_admin());

-- contact_messages: admin-only reads/writes, public insert kept
DROP POLICY IF EXISTS "Authenticated can read messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated can update messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Authenticated can delete messages" ON public.contact_messages;
CREATE POLICY "Admins can read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.is_admin());

-- meetings: admin-only
DROP POLICY IF EXISTS "Authenticated can manage meetings" ON public.meetings;
CREATE POLICY "Admins can manage meetings" ON public.meetings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- profiles: explicit self insert, no delete
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
REVOKE DELETE ON public.profiles FROM authenticated, anon;

-- SECURITY DEFINER functions must not be callable from the API by untrusted roles
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
REVOKE ALL ON FUNCTION public.capture_strategy_progress_snapshot(uuid) FROM anon;