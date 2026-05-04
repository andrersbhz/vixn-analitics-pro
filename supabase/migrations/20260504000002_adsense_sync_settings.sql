-- Adicionando configurações de sincronização à tabela de conexões
ALTER TABLE public.platform_connections 
ADD COLUMN IF NOT EXISTS sync_interval_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS sync_history JSONB DEFAULT '[]'::jsonb;
