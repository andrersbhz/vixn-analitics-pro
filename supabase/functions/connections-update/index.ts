import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Método não permitido.' }, 405);
    }

    const { id, config, isConnected, syncIntervalMinutes } = await req.json();

    if (!id || typeof id !== 'string') {
      return jsonResponse({ error: 'ID da conexão é obrigatório.' }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: existing, error: readError } = await supabase
      .from('platform_connections')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (readError) throw readError;
    if (!existing) return jsonResponse({ error: 'Conexão não encontrada.' }, 404);

    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (config && typeof config === 'object' && !Array.isArray(config)) {
      // Merge in the backend so credentials intentionally hidden from the
      // browser (OAuth tokens, application passwords, secrets) are never
      // erased when the user saves unrelated settings.
      update.config = {
        ...(existing.config || {}),
        ...(config as Record<string, unknown>),
      };
    }

    if (typeof isConnected === 'boolean') {
      update.is_connected = isConnected;
    }

    if (typeof syncIntervalMinutes === 'number' && Number.isFinite(syncIntervalMinutes) && syncIntervalMinutes > 0) {
      const nextSync = new Date();
      nextSync.setMinutes(nextSync.getMinutes() + syncIntervalMinutes);
      update.sync_interval_minutes = Math.round(syncIntervalMinutes);
      update.next_sync_at = nextSync.toISOString();
    }

    const { data, error } = await supabase
      .from('platform_connections')
      .update(update)
      .eq('id', id)
      .select('id,name,is_connected,sync_interval_minutes,next_sync_at,last_sync_at,cached_data')
      .single();

    if (error) throw error;

    return jsonResponse({ success: true, connection: data });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      500,
    );
  }
});
