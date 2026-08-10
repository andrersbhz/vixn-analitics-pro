import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const token = req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    const { data: userData } = await supabase.auth.getUser(token)
    const userId = userData?.user?.id
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Não autenticado.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabase.from('platform_connections').update({ user_id: userId }).is('user_id', null)

    const { data, error } = await supabase
      .from('platform_connections')
      .select('id,name,is_connected,config,sync_interval_minutes,next_sync_at,last_sync_at')
      .eq('user_id', userId)
      .order('id', { ascending: true })

    if (error) throw error

    const connections = (data || []).map((connection) => ({
      ...connection,
      config: sanitizeConfig(connection.config),
    }))

    return new Response(JSON.stringify({ connections }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Erro ao carregar conexões.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function sanitizeConfig(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const sensitiveKeys = new Set([
    'oauth',
    'access_token',
    'refresh_token',
    'id_token',
    'token',
    'api_key',
    'apikey',
    'client_secret',
    'password',
    'secret',
  ])

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([key]) => !sensitiveKeys.has(key.toLowerCase())),
  )
}