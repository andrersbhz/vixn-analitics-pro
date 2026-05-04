-- Criar tabela de histórico de sincronização se não existir
CREATE TABLE IF NOT EXISTS public.sync_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT NOT NULL,
    status TEXT NOT NULL, -- 'success' | 'error'
    detail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Garantir colunas de configuração na tabela platform_connections
ALTER TABLE public.platform_connections 
ADD COLUMN IF NOT EXISTS sync_interval_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS next_sync_at TIMESTAMP WITH TIME ZONE;
