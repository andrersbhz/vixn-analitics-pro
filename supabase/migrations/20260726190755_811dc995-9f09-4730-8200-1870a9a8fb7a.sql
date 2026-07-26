
-- platform_connections
DROP POLICY IF EXISTS "Public read platform_connections" ON public.platform_connections;
DROP POLICY IF EXISTS "Public insert platform_connections" ON public.platform_connections;
DROP POLICY IF EXISTS "Public update platform_connections" ON public.platform_connections;
DROP POLICY IF EXISTS "Public delete platform_connections" ON public.platform_connections;

REVOKE ALL ON public.platform_connections FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_connections TO authenticated;
GRANT ALL ON public.platform_connections TO service_role;

CREATE POLICY "Authenticated read platform_connections" ON public.platform_connections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert platform_connections" ON public.platform_connections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update platform_connections" ON public.platform_connections FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated delete platform_connections" ON public.platform_connections FOR DELETE TO authenticated USING (true);

-- platform_items
DROP POLICY IF EXISTS "Allow public read access to platform items" ON public.platform_items;
DROP POLICY IF EXISTS "Allow public insert/update to platform items" ON public.platform_items;

REVOKE ALL ON public.platform_items FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_items TO authenticated;
GRANT ALL ON public.platform_items TO service_role;

CREATE POLICY "Authenticated read platform_items" ON public.platform_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated write platform_items" ON public.platform_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- sync_history
DROP POLICY IF EXISTS "Public read sync_history" ON public.sync_history;
DROP POLICY IF EXISTS "Public insert sync_history" ON public.sync_history;

REVOKE ALL ON public.sync_history FROM anon;
GRANT SELECT, INSERT ON public.sync_history TO authenticated;
GRANT ALL ON public.sync_history TO service_role;

CREATE POLICY "Authenticated read sync_history" ON public.sync_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert sync_history" ON public.sync_history FOR INSERT TO authenticated WITH CHECK (true);
