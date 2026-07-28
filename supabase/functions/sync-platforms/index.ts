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

        // Últimos 365 dias, por dia
        const end = new Date()
        const start = new Date(); start.setDate(start.getDate() - 365)
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
        for (const m of [
          'ESTIMATED_EARNINGS','CLICKS','IMPRESSIONS','PAGE_VIEWS',
          'IMPRESSIONS_CTR','COST_PER_CLICK','PAGE_VIEWS_RPM','IMPRESSIONS_RPM',
          'AD_REQUESTS','MATCHED_AD_REQUESTS','AD_REQUESTS_CTR'
        ]) reportUrl.searchParams.append('metrics', m)

        const rep = await fetch(reportUrl.toString(), { headers: { Authorization: `Bearer ${accessToken}` } })
        const repData = await rep.json()
        if (!rep.ok) throw new Error(repData?.error?.message || 'Falha na AdSense API')

        const rows = repData.rows || []
        let sumEarn = 0, sumClicks = 0, sumImp = 0, sumViews = 0
        results = rows.map((row: any) => {
          const cells = row.cells || []
          const date = cells[0]?.value
          const earnings = parseFloat(cells[1]?.value || '0')
          const clicks = parseInt(cells[2]?.value || '0')
          const impressions = parseInt(cells[3]?.value || '0')
          const views = parseInt(cells[4]?.value || '0')
          sumEarn += earnings; sumClicks += clicks; sumImp += impressions; sumViews += views
          return {
            platform_id: 'adsense',
            external_id: `adsense-${date}`,
            title: `Ganhos ${date}`,
            link: 'https://adsense.google.com',
            earnings, clicks, impressions, views,
            ctr: parseFloat(cells[5]?.value || '0'),
            rpm: parseFloat(cells[6]?.value || '0'),
            metadata: {
              date,
              cpc: parseFloat(cells[6]?.value || '0'),
              page_rpm: parseFloat(cells[7]?.value || '0'),
              imp_rpm: parseFloat(cells[8]?.value || '0'),
              ad_requests: parseInt(cells[9]?.value || '0'),
              matched_requests: parseInt(cells[10]?.value || '0'),
              ad_request_ctr: parseFloat(cells[11]?.value || '0'),
            }
          }
        })

        // Recarrega config (pode ter mudado durante refresh do token) e grava totais
        const { data: freshConn } = await supabaseClient
          .from('platform_connections').select('config').eq('id', platformId).single()
        const currentConfig = (freshConn?.config as any) || connection.config
        const totalsCells = repData?.totals?.cells || []
        const lifetime = {
          earnings: parseFloat(totalsCells[1]?.value || String(sumEarn)),
          clicks: parseInt(totalsCells[2]?.value || String(sumClicks)),
          impressions: parseInt(totalsCells[3]?.value || String(sumImp)),
          page_views: parseInt(totalsCells[4]?.value || String(sumViews)),
          days: rows.length,
          updated_at: new Date().toISOString(),
        }
        await supabaseClient.from('platform_connections')
          .update({ config: { ...currentConfig, lifetime } })
          .eq('id', platformId)
      } else if (platformId === 'youtube') {
       const channelId = config.id
       if (!channelId) throw new Error('ID do Canal YouTube não configurado')
 
       const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
       const response = await fetch(rssUrl)
        const xml = await response.text();
        
        const channelTitleMatch = xml.match(/<title>(.*?)<\/title>/);
        if (channelTitleMatch) channelName = channelTitleMatch[1];

       // Fetch subscriber count by scraping the public channel about page.
       // YouTube retorna o total no campo `subscriberCountText` do JSON embutido.
       try {
         const aboutRes = await fetch(`https://www.youtube.com/channel/${channelId}/about`, {
           headers: {
             'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
             'User-Agent': 'Mozilla/5.0 (compatible; SparkGrowthBot/1.0)'
           }
         });
         const html = await aboutRes.text();
         const subText =
           html.match(/"subscriberCountText":\{"simpleText":"([^"]+)"\}/)?.[1]
           || html.match(/"subscriberCountText":\{"accessibility":\{[^}]*\},"simpleText":"([^"]+)"\}/)?.[1]
           || html.match(/([\d.,]+\s*(?:mil|mi|K|M|B)?)\s*inscrit/i)?.[1]
           || html.match(/([\d.,]+\s*(?:K|M|B)?)\s*subscriber/i)?.[1]
           || '';
         const parseSubs = (s: string) => {
           if (!s) return 0;
           const m = s.replace(/\s/g, '').match(/([\d.,]+)([KMBkmb]|mil|mi)?/);
           if (!m) return 0;
           const num = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
           const suf = (m[2] || '').toLowerCase();
           const mult = suf === 'k' || suf === 'mil' ? 1_000
             : suf === 'm' || suf === 'mi' ? 1_000_000
             : suf === 'b' ? 1_000_000_000 : 1;
           return Math.round(num * mult);
         };
         const subscribers = parseSubs(subText);
         (globalThis as any).__ytSubs = { subscribers, subscribersText: subText };
       } catch (e) {
         console.log('subs scrape failed', e);
       }

        // Parse each <entry> block individually — the RSS order is
        // yt:videoId → title → link, so a single cross-field regex on the
        // whole document mis-aligns fields across entries.
        const entryBlocks = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
        for (const block of entryBlocks) {
          const videoId = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
          if (!videoId) continue;
          const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim() || 'Sem título';
          const link = block.match(/<link rel="alternate" href="([^"]+)"/)?.[1]
            || `https://www.youtube.com/watch?v=${videoId}`;
          const views = parseInt(block.match(/<media:statistics[^>]*views="(\d+)"/)?.[1] || '0');
          const rating = parseFloat(block.match(/<media:starRating[^>]*average="([\d.]+)"/)?.[1] || '0');
          const ratingCount = parseInt(block.match(/<media:starRating[^>]*count="(\d+)"/)?.[1] || '0');
          const description = block.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1]?.trim() || '';
          const published = block.match(/<published>([^<]+)<\/published>/)?.[1] || null;
          const engagement = views > 0 ? (ratingCount / views) * 100 : 0;

          results.push({
            platform_id: 'youtube',
            external_id: videoId,
            title,
            link,
            views,
            impressions: 0,
            ctr: 0,
            engagement_rate: Number(engagement.toFixed(2)),
            avg_watch_time: 0,
            metadata: { video_id: videoId, rating, rating_count: ratingCount, description, published }
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

      if (platformId === 'youtube') {
        const subs = (globalThis as any).__ytSubs;
        if (subs && subs.subscribers) {
          const { data: cur } = await supabaseClient
            .from('platform_connections').select('cached_data').eq('id', platformId).maybeSingle();
          updateData.cached_data = { ...(cur?.cached_data || {}), subscribers: subs.subscribers, subscribers_text: subs.subscribersText };
        }
      }
 
     await supabaseClient
       .from('platform_connections')
       .update(updateData)
       .eq('id', platformId)
 
      return new Response(JSON.stringify({ success: true, count: results.length, v: 'yt-parser-v2' }), {
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