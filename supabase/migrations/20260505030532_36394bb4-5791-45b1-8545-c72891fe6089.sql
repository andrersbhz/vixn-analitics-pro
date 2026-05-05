-- Add metric columns to platform_items
ALTER TABLE public.platform_items ADD COLUMN IF NOT EXISTS earnings DECIMAL(12,2) DEFAULT 0;
ALTER TABLE public.platform_items ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE public.platform_items ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
ALTER TABLE public.platform_items ADD COLUMN IF NOT EXISTS rpm DECIMAL(10,2) DEFAULT 0;

-- Ensure unique constraint for upsert based on external_id and platform_id
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'platform_items_platform_external_key') THEN
        ALTER TABLE public.platform_items ADD CONSTRAINT platform_items_platform_external_key UNIQUE (platform_id, external_id);
    END IF;
END $$;