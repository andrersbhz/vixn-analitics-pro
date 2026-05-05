
CREATE TABLE public.platform_connections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  sync_interval_minutes INTEGER DEFAULT 60,
  next_sync_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  last_sync_log TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id TEXT NOT NULL,
  status TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read platform_connections" ON public.platform_connections FOR SELECT USING (true);
CREATE POLICY "Public insert platform_connections" ON public.platform_connections FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update platform_connections" ON public.platform_connections FOR UPDATE USING (true);
CREATE POLICY "Public delete platform_connections" ON public.platform_connections FOR DELETE USING (true);

CREATE POLICY "Public read sync_history" ON public.sync_history FOR SELECT USING (true);
CREATE POLICY "Public insert sync_history" ON public.sync_history FOR INSERT WITH CHECK (true);

INSERT INTO public.platform_connections (id, name, is_connected, config) VALUES
  ('youtube', 'YouTube', false, '{}'::jsonb),
  ('wordpress', 'WordPress', false, '{}'::jsonb),
  ('facebook', 'Facebook Ads', false, '{}'::jsonb),
  ('adsense', 'Google AdSense', false, '{}'::jsonb);
