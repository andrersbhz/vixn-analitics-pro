ALTER TABLE public.platform_items 
ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ctr DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS engagement_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_watch_time INTEGER DEFAULT 0; -- in seconds

COMMENT ON COLUMN public.platform_items.impressions IS 'Total number of times the item was shown';
COMMENT ON COLUMN public.platform_items.ctr IS 'Click-through rate percentage';
COMMENT ON COLUMN public.platform_items.engagement_rate IS 'Engagement rate percentage (likes/comments/shares vs views)';
COMMENT ON COLUMN public.platform_items.avg_watch_time IS 'Average duration users watched/stayed on content';