
-- platform_connections write policies
DROP POLICY IF EXISTS "Authenticated insert platform_connections" ON public.platform_connections;
DROP POLICY IF EXISTS "Authenticated update platform_connections" ON public.platform_connections;
DROP POLICY IF EXISTS "Authenticated delete platform_connections" ON public.platform_connections;
CREATE POLICY "Authenticated insert platform_connections" ON public.platform_connections FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update platform_connections" ON public.platform_connections FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete platform_connections" ON public.platform_connections FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- platform_items write policy (split ALL into specific writes)
DROP POLICY IF EXISTS "Authenticated write platform_items" ON public.platform_items;
CREATE POLICY "Authenticated insert platform_items" ON public.platform_items FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update platform_items" ON public.platform_items FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated delete platform_items" ON public.platform_items FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

-- sync_history insert
DROP POLICY IF EXISTS "Authenticated insert sync_history" ON public.sync_history;
CREATE POLICY "Authenticated insert sync_history" ON public.sync_history FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
