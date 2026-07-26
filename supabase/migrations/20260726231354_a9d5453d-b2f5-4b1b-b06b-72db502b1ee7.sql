
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_items TO authenticated;
GRANT ALL ON public.platform_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_connections TO authenticated;
GRANT ALL ON public.platform_connections TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sync_history TO authenticated;
GRANT ALL ON public.sync_history TO service_role;
