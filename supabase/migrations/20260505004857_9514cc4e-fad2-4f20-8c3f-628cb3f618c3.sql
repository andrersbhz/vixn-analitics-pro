-- Add a column to store cached data for the connection
ALTER TABLE public.platform_connections ADD COLUMN IF NOT EXISTS cached_data JSONB DEFAULT '{}'::jsonb;

-- Create a table for specific items (videos, posts, pages) to make it truly dynamic
CREATE TABLE IF NOT EXISTS public.platform_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT NOT NULL, -- 'youtube', 'facebook', 'wordpress'
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(platform_id, external_id)
);

ALTER TABLE public.platform_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to platform items"
ON public.platform_items FOR SELECT
USING (true);

CREATE POLICY "Allow public insert/update to platform items"
ON public.platform_items FOR ALL
USING (true)
WITH CHECK (true);
