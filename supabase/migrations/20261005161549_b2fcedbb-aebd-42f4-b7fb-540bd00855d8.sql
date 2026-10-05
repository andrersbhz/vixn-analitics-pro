DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Public can view active plans" ON public.catalog_plans;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Public can view active plans" ON public.catalog_plans FOR SELECT TO anon, authenticated USING (is_active);
GRANT SELECT ON public.products, public.catalog_plans TO anon, authenticated;