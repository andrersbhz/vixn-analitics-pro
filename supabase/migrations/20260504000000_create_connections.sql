CREATE TABLE IF NOT EXISTS public.platform_connections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_connected BOOLEAN DEFAULT FALSE,
    config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to platform_connections" 
ON public.platform_connections FOR ALL 
USING (true) 
WITH CHECK (true);

INSERT INTO public.platform_connections (id, name, is_connected, config)
VALUES 
    ('youtube', 'YouTube', false, '{}'),
    ('wordpress', 'WordPress', false, '{}'),
    ('facebook', 'Facebook Ads', false, '{}')
ON CONFLICT (id) DO NOTHING;
