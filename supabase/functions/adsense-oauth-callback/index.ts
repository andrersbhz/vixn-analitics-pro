import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const frontendCallbackPath = '/adsense/oauth/callback'
const primaryFrontendOrigin = 'https://analitics.a3solucoesdigitais.com'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url = new URL(req.url)
  const isJsonRequest = req.method !== 'GET'

  let code = url.searchParams.get('code') || ''
  let stateRaw = url.searchParams.get('state') || ''
  let explicitRedirectUri = ''

  if (isJsonRequest) {
    const body = await readJsonBody(req)
    code = getString(body.code)
    stateRaw = getString(body.state)
    explicitRedirectUri = getString(body.redirect_uri)
  }

  const state = decodeState(stateRaw)
  const returnTo = getString(state.return_to)

  const errorParam = url.searchParams.get('error')
  if (errorParam || !code) {
    const message = errorParam || 'Código não retornado.'
    return isJsonRequest ? jsonResponse({ error: message }, 400) : htmlResponse(`<h1>Falha na autorização</h1><p>${escapeHtml(message)}</p>`)
  }

  try {
    const clientId = Deno.env.get('GOOGLE_ADSENSE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_ADSENSE_CLIENT_SECRET')
    if (!clientId || !clientSecret) throw new Error('Credenciais do Google não configuradas nos segredos.')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] ?? ''
    const legacyRedirectUri = `https://${projectRef}.supabase.co/functions/v1/adsense-oauth-callback`
    const redirectUri = explicitRedirectUri || getString(state.redirect_uri) || `${primaryFrontendOrigin}${frontendCallbackPath}`
    if (redirectUri !== legacyRedirectUri && !isAllowedFrontendCallback(redirectUri)) {
      throw new Error('URL OAuth inválida. Gere a conexão novamente em Configurações.')
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: redirectUri, grant_type: 'authorization_code',
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) throw new Error(tokenData.error_description || tokenData.error || 'Falha ao trocar código por token')

    // Descobrir a conta AdSense do usuário
    let accountName = ''
    let pubId = ''
    let accountWarning = ''
    try {
      const acctRes = await fetch('https://adsense.googleapis.com/v2/accounts', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      const acctData = await acctRes.json()
      if (!acctRes.ok) throw new Error(acctData?.error?.message || 'Falha ao localizar conta AdSense')
      const first = acctData?.accounts?.[0]
      if (first) {
        accountName = first.name // "accounts/pub-XXXX"
        pubId = first.name?.split('/')?.[1] || ''
      } else {
        accountWarning = 'Conta Google autorizada, mas nenhuma conta AdSense foi encontrada nessa conta.'
      }
    } catch (error: any) {
      accountWarning = error.message || 'Não foi possível confirmar a conta AdSense autorizada.'
    }

    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')

    const { data: existing } = await supabase
      .from('platform_connections')
      .select('config')
      .eq('id', 'adsense')
      .single()

    const newConfig = {
      ...(existing?.config || {}),
      id: pubId || (existing?.config as any)?.id || '',
      oauth: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || (existing?.config as any)?.oauth?.refresh_token || '',
        expires_at: Date.now() + (tokenData.expires_in ?? 3600) * 1000,
        account_name: accountName,
      },
    }

    const { error: saveError } = await supabase.from('platform_connections')
      .upsert({
        id: 'adsense',
        name: 'Google AdSense',
        config: newConfig,
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (saveError) throw new Error(`Não foi possível salvar a conexão AdSense: ${saveError.message}`)

    const back = returnTo || '/settings'
    if (isJsonRequest) {
      return jsonResponse({ success: true, warning: accountWarning, return_to: back })
    }

    return htmlResponse(`
      <h1>Google AdSense conectado ✓</h1>
      <p>${escapeHtml(accountWarning || 'Você pode fechar esta aba.')}</p>
      <script>setTimeout(() => { window.location.href = ${JSON.stringify(back)} }, 1200)</script>
    `)
  } catch (error: any) {
    return isJsonRequest ? jsonResponse({ error: error.message }, 400) : htmlResponse(`<h1>Erro</h1><pre>${escapeHtml(error.message)}</pre>`)
  }
})

async function readJsonBody(req: Request) {
  const text = await req.text()
  if (!text) return {}
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return {}
  }
}

function decodeState(stateRaw: string) {
  try {
    return JSON.parse(atob(stateRaw)) as Record<string, unknown>
  } catch {
    return {}
  }
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function isAllowedFrontendCallback(value: string) {
  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()
    const allowedHost = hostname === 'localhost' || hostname.endsWith('.lovable.app') || hostname === 'analitics.a3solucoesdigitais.com'
    return allowedHost && url.pathname === frontendCallbackPath
  } catch {
    return false
  }
}

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function htmlResponse(body: string) {
  return new Response(`<!doctype html><meta charset="utf-8"><style>body{font-family:system-ui;padding:40px;background:#0b1220;color:#e2e8f0}h1{font-weight:300}</style>${body}`, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}