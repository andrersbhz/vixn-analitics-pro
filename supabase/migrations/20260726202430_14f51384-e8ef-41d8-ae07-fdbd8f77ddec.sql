GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.platform_items TO authenticated;
GRANT ALL ON TABLE public.platform_items TO service_role;
GRANT SELECT ON TABLE public.platform_items TO anon;