ALTER TABLE public.platform_connections ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.platform_items ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.sync_history ADD COLUMN IF NOT EXISTS user_id uuid;

DO $$
DECLARE only_user uuid;
BEGIN
  IF (SELECT count(*) FROM auth.users) = 1 THEN
    SELECT id INTO only_user FROM auth.users LIMIT 1;
    UPDATE public.platform_connections SET user_id = only_user WHERE user_id IS NULL;
    UPDATE public.platform_items SET user_id = only_user WHERE user_id IS NULL;
    UPDATE public.sync_history SET user_id = only_user WHERE user_id IS NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS platform_items_user_id_idx ON public.platform_items(user_id);
CREATE INDEX IF NOT EXISTS sync_history_user_id_idx ON public.sync_history(user_id);

DROP POLICY IF EXISTS "Authenticated read platform_connections" ON public.platform_connections;
DROP POLICY IF EXISTS "Authenticated insert platform_connections" ON public.platform_connections;
DROP POLICY IF EXISTS "Authenticated update platform_connections" ON public.platform_connections;
DROP POLICY IF EXISTS "Authenticated delete platform_connections" ON public.platform_connections;

DROP POLICY IF EXISTS "Authenticated read platform_items" ON public.platform_items;
DROP POLICY IF EXISTS "Authenticated insert platform_items" ON public.platform_items;
DROP POLICY IF EXISTS "Authenticated update platform_items" ON public.platform_items;
DROP POLICY IF EXISTS "Authenticated delete platform_items" ON public.platform_items;

DROP POLICY IF EXISTS "Authenticated read sync_history" ON public.sync_history;
DROP POLICY IF EXISTS "Authenticated insert sync_history" ON public.sync_history;

CREATE POLICY "own_platform_connections" ON public.platform_connections
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "own_platform_items" ON public.platform_items
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "own_sync_history_select" ON public.sync_history
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "own_sync_history_insert" ON public.sync_history
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

REVOKE ALL ON public.platform_connections FROM anon;
REVOKE ALL ON public.platform_items FROM anon;
REVOKE ALL ON public.sync_history FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_connections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_items TO authenticated;
GRANT SELECT, INSERT ON public.sync_history TO authenticated;
GRANT ALL ON public.platform_connections TO service_role;
GRANT ALL ON public.platform_items TO service_role;
GRANT ALL ON public.sync_history TO service_role;