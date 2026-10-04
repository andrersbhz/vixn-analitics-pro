CREATE TABLE public.catalog_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  price text NOT NULL DEFAULT '',
  period text NOT NULL DEFAULT '/mês',
  description text,
  features text[] NOT NULL DEFAULT '{}',
  is_highlight boolean NOT NULL DEFAULT false,
  checkout_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.catalog_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.catalog_plans TO authenticated;
GRANT ALL ON public.catalog_plans TO service_role;
ALTER TABLE public.catalog_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active plans" ON public.catalog_plans FOR SELECT USING (is_active OR private.is_admin());
CREATE POLICY "Admins manage plans" ON public.catalog_plans FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE TRIGGER trg_catalog_plans_updated BEFORE UPDATE ON public.catalog_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text,
  description text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  image_url text,
  category text,
  checkout_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active OR private.is_admin());
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.catalog_plans (name, slug, price, period, description, features, is_highlight, sort_order) VALUES
('Start','start','R$ 2.900','/mês','Valide um módulo e prove valor rápido.', ARRAY['1 módulo sob medida','Dashboard conectado','Integrações essenciais','Suporte comercial'], false, 1),
('Growth','growth','R$ 6.900','/mês','Conecte a operação e acelere a escala.', ARRAY['Até 4 módulos','IA aplicada ao negócio','Análises avançadas','Suporte prioritário'], true, 2),
('Enterprise','enterprise','Sob consulta','','Ecossistema completo e personalizado.', ARRAY['Módulos ilimitados','Infraestrutura dedicada','Modelos privados de IA','SLA contratual'], false, 3);