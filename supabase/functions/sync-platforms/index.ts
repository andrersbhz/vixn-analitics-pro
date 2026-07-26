 import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
 import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
 
 const corsHeaders = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 }
 
 serve(async (req) => {
   if (req.method === 'OPTIONS') {
     return new Response('ok', { headers: corsHeaders })
   }
 
   try {
     const supabaseClient = createClient(
       Deno.env.get('SUPABASE_URL') ?? '',
       Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
     )
 
     const { platformId } = await req.json()
 
     const { data: connection, error: connError } = await supabaseClient
       .from('platform_connections')
       .select('*')
       .eq('id', platformId)
       .single()
 
     if (connError || !connection) {
       throw new Error('Conexão não encontrada')
     }
 
     const config = connection.config
     let results = []
 
     let channelName = ''
 
      if (platformId === 'adsense') {
        const oauth = (config as any).oauth
        if (!oauth?.access_token) {
          await supabaseClient.from('platform_connections')
            .update({ last_sync_at: new Date().toISOString() }).eq('id', platformId)
          return new Response(JSON.stringify({
            success: true, count: 0,
            warning: 'Conecte o Google AdSense via OAuth2 (botão em Configurações) para receber dados reais.'
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
        }

        // Renovar token se expirado
        let accessToken: string = oauth.access_token
        if (oauth.expires_at && Date.now() > oauth.expires_at - 60_000 && oauth.refresh_token) {
          const clientId = Deno.env.get('GOOGLE_ADSENSE_CLIENT_ID')
          const clientSecret = Deno.env.get('GOOGLE_ADSENSE_CLIENT_SECRET')
          const rr = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: clientId ?? '', client_secret: clientSecret ?? '',
              refresh_token: oauth.refresh_token, grant_type: 'refresh_token',
            }),
          })
          const rd = await rr.json()
          if (rr.ok && rd.access_token) {
            accessToken = rd.access_token
            const newConfig = { ...config, oauth: {
              ...oauth, access_token: rd.access_token,
              expires_at: Date.now() + (rd.expires_in ?? 3600) * 1000,
            }}
            await supabaseClient.from('platform_connections')
              .update({ config: newConfig }).eq('id', platformId)
          }
        }

        const accountName = oauth.account_name // "accounts/pub-XXXX"
        if (!accountName) throw new Error('Conta AdSense não identificada. Reconecte via OAuth.')

        // Últimos 30 dias, por dia
        const end = new Date()
        const start = new Date(); start.setDate(start.getDate() - 30)
        const fmt = (d: Date) => ({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, day: d.getUTCDate() })
        const s = fmt(start), e = fmt(end)
        const reportUrl = new URL(`https://adsense.googleapis.com/v2/${accountName}/reports:generate`)
        reportUrl.searchParams.append('dateRange', 'CUSTOM')
        reportUrl.searchParams.append('startDate.year', String(s.y))
        reportUrl.searchParams.append('startDate.month', String(s.m))
        reportUrl.searchParams.append('startDate.day', String(s.day))
        reportUrl.searchParams.append('endDate.year', String(e.y))
        reportUrl.searchParams.append('endDate.month', String(e.m))
        reportUrl.searchParams.append('endDate.day', String(e.day))
        for (const dim of ['DATE']) reportUrl.searchParams.append('dimensions', dim)
        for (const m of ['ESTIMATED_EARNINGS','CLICKS','IMPRESSIONS','PAGE_VIEWS','IMPRESSIONS_CTR','COST_PER_CLICK'])
          reportUrl.searchParams.append('metrics', m)

        const rep = await fetch(reportUrl.toString(), { headers: { Authorization: `Bearer ${accessToken}` } })
        const repData = await rep.json()
        if (!rep.ok) throw new Error(repData?.error?.message || 'Falha na AdSense API')

        const rows = repData.rows || []
        results = rows.map((row: any) => {
          const cells = row.cells || []
          const date = cells[0]?.value
          return {
            platform_id: 'adsense',
            external_id: `adsense-${date}`,
            title: `Ganhos ${date}`,
            link: 'https://adsense.google.com',
            earnings: parseFloat(cells[1]?.value || '0'),
            clicks: parseInt(cells[2]?.value || '0'),
            impressions: parseInt(cells[3]?.value || '0'),
            views: parseInt(cells[4]?.value || '0'),
            ctr: parseFloat(cells[5]?.value || '0'),
            rpm: parseFloat(cells[6]?.value || '0'),
            metadata: { date }
          }
        })
      } else if (platformId === 'youtube') {
       const channelId = config.id
       if (!channelId) throw new Error('ID do Canal YouTube não configurado')
 
       const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
       const response = await fetch(rssUrl)
        const xml = await response.text();
        
        const channelTitleMatch = xml.match(/<title>(.*?)<\/title>/);
        if (channelTitleMatch) channelName = channelTitleMatch[1];

        // Simple XML parsing for entries
        const entries = xml.matchAll(/<entry>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link rel="alternate" href="(.*?)"\/>[\s\S]*?<yt:videoId>(.*?)<\/yt:videoId>[\s\S]*?<\/entry>/g);
        
        for (const match of entries) {
          results.push({
            platform_id: 'youtube',
            external_id: match[3],
            title: match[1],
            link: match[2],
            views: 0,
            impressions: 0,
            ctr: 0,
            engagement_rate: 0,
            avg_watch_time: 0,
            metadata: { video_id: match[3] }
          });
        }
      } else if (platformId === 'wordpress') {
        let posts = [];
        
        if (config.method === 'jetpack') {
          // Jetpack usa a REST API pública do WordPress.com
          const siteUrl = (config.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
          if (!siteUrl) throw new Error('URL do site Jetpack não configurada');
          const response = await fetch(
            `https://public-api.wordpress.com/wp/v2/sites/${encodeURIComponent(siteUrl)}/posts?per_page=20`,
            { signal: AbortSignal.timeout(10000) }
          );
          if (!response.ok) {
            const t = await response.text();
            throw new Error(`Jetpack API (${response.status}): ${t.substring(0, 120)}`);
          }
          posts = await response.json();
        } else {
          const baseUrl = config.url.replace(/\/$/, '');
          const useAuth = Boolean(config.user && config.password);
          const headers: Record<string,string> = {};
          if (useAuth) headers['Authorization'] = `Basic ${btoa(`${config.user}:${config.password}`)}`;
          
          try {
            const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts?per_page=20`, {
              headers,
              signal: AbortSignal.timeout(10000)
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`WordPress API error (${response.status}): ${errorText.substring(0, 100)}`);
            }
            
            posts = await response.json();
          } catch (fetchError) {
             console.error('Fetch error:', fetchError);
             throw fetchError;
          }
        }
        
        results = posts.map((post: any) => ({
          platform_id: 'wordpress',
          external_id: post.id.toString(),
          title: post.title?.rendered || post.title || 'Post sem título',
          link: post.link || '#',
          views: 0,
          clicks: 0,
          impressions: 0,
          ctr: 0,
          metadata: { date: post.date }
        }));
      }
 
     // Upsert results into platform_items
     if (results.length > 0) {
       const { error: upsertError } = await supabaseClient
         .from('platform_items')
         .upsert(results, { onConflict: 'platform_id,external_id' })
 
       if (upsertError) throw upsertError
     }
 
     // Update connection status and cached metadata
     const updateData: any = { 
       last_sync_at: new Date().toISOString(),
       is_connected: true 
     }
 
     if (channelName) {
       updateData.name = channelName
     }
 
     await supabaseClient
       .from('platform_connections')
       .update(updateData)
       .eq('id', platformId)
 
     return new Response(JSON.stringify({ success: true, count: results.length }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 200,
     })
   } catch (error) {
     return new Response(JSON.stringify({ error: error.message }), {
       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
       status: 400,
     })
   }
 })