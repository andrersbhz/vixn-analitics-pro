import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const stateRaw = url.searchParams.get('state') || ''
  let returnTo = ''
  try { returnTo = JSON.parse(atob(stateRaw))?.return_to || '' } catch { /* noop */ }

  const errorParam = url.searchParams.get('error')
  if (errorParam || !code) {
    return htmlResponse(`<h1>Falha na autorização</h1><p>${errorParam || 'Código não retornado.'}</p>`)
  }

  try {
    const clientId = Deno.env.get('GOOGLE_ADSENSE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_ADSENSE_CLIENT_SECRET')
    if (!clientId || !clientSecret) throw new Error('Credenciais do Google não configuradas nos segredos.')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] ?? ''
    const redirectUri = `https://${projectRef}.supabase.co/functions/v1/adsense-oauth-callback`

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
    try {
      const acctRes = await fetch('https://adsense.googleapis.com/v2/accounts', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      const acctData = await acctRes.json()
      const first = acctData?.accounts?.[0]
      if (first) {
        accountName = first.name // "accounts/pub-XXXX"
        pubId = first.name?.split('/')?.[1] || ''
      }
    } catch { /* opcional */ }

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
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + (tokenData.expires_in ?? 3600) * 1000,
        account_name: accountName,
      },
    }

    await supabase.from('platform_connections')
      .update({ config: newConfig, is_connected: true, updated_at: new Date().toISOString() })
      .eq('id', 'adsense')

    const back = returnTo || '/settings'
    return htmlResponse(`
      <h1>Google AdSense conectado ✓</h1>
      <p>Você pode fechar esta aba.</p>
      <script>setTimeout(() => { window.location.href = ${JSON.stringify(back)} }, 1200)</script>
    `)
  } catch (error: any) {
    return htmlResponse(`<h1>Erro</h1><pre>${error.message}</pre>`)
  }
})

function htmlResponse(body: string) {
  return new Response(`<!doctype html><meta charset="utf-8"><style>body{font-family:system-ui;padding:40px;background:#0b1220;color:#e2e8f0}h1{font-weight:300}</style>${body}`, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}