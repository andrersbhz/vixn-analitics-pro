import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const clientId = Deno.env.get('GOOGLE_ADSENSE_CLIENT_ID')
    if (!clientId) {
      return new Response(JSON.stringify({
        error: 'GOOGLE_ADSENSE_CLIENT_ID não configurado. Adicione o Client ID do Google Cloud nas configurações de segredos.'
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] ?? ''
    const redirectUri = `https://${projectRef}.supabase.co/functions/v1/adsense-oauth-callback`

    const url = new URL(req.url)
    const returnTo = url.searchParams.get('return_to') || ''

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/adsense.readonly')
    authUrl.searchParams.set('state', btoa(JSON.stringify({ return_to: returnTo })))

    return new Response(JSON.stringify({ auth_url: authUrl.toString(), redirect_uri: redirectUri }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})