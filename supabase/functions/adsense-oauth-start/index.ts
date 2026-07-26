import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const callbackPath = '/adsense/oauth/callback'
const primaryFrontendOrigin = 'https://analitics.a3solucoesdigitais.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const clientId = Deno.env.get('GOOGLE_ADSENSE_CLIENT_ID')
    if (!clientId) {
      return new Response(JSON.stringify({
        error: 'GOOGLE_ADSENSE_CLIENT_ID não configurado. Adicione o Client ID do Google Cloud nas configurações de segredos.'
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const url = new URL(req.url)
    const body = await readJsonBody(req)
    const returnTo = getString(body.return_to) || url.searchParams.get('return_to') || ''
    const requestedRedirectUri = getString(body.redirect_uri) || url.searchParams.get('redirect_uri') || ''
    getAllowedOrigin(requestedRedirectUri || returnTo || req.headers.get('origin') || '')
    const redirectUri = `${primaryFrontendOrigin}${callbackPath}`

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')
    authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/adsense.readonly')
    authUrl.searchParams.set('include_granted_scopes', 'true')
    authUrl.searchParams.set('state', btoa(JSON.stringify({ return_to: returnTo, redirect_uri: redirectUri })))

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

async function readJsonBody(req: Request) {
  if (req.method === 'GET') return {}
  const text = await req.text()
  if (!text) return {}
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return {}
  }
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function getAllowedOrigin(value: string) {
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()
    const allowed = hostname === 'localhost' || hostname.endsWith('.lovable.app') || hostname === 'analitics.a3solucoesdigitais.com'
    return allowed ? url.origin : ''
  } catch {
    return ''
  }
}