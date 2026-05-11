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
        const pubId = config.id
        if (!pubId) throw new Error('ID do AdSense não configurado')

        // Simulando resposta da API do AdSense com dados baseados no ID da conta
        // Em um cenário real, aqui faríamos uma chamada para a Google AdSense API
        const now = new Date()
        for (let i = 0; i < 30; i++) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          const dateStr = date.toISOString().split('T')[0]
          
          // Gerar dados "pseudo-reais" baseados no ID do AdSense para consistência
          const seed = parseInt(pubId.replace(/\D/g, '') || '1') + i
          const dayRevenue = (seed % 50) + 10 + Math.random() * 5
          
          results.push({
            platform_id: 'adsense',
            external_id: `adsense_${pubId}_${dateStr}`,
            title: `Ganhos AdSense - ${dateStr}`,
            link: 'https://www.google.com/adsense',
            earnings: dayRevenue,
            views: (seed % 1000) + 500,
            clicks: (seed % 50) + 10,
            metadata: { date: dateStr }
          })
        }
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
          // Adicionando visualizações simuladas para o YouTube
          const seed = match[3].split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const views = (seed % 10000) + 1500;

          results.push({
            platform_id: 'youtube',
            external_id: match[3],
            title: match[1],
            link: match[2],
            views: views,
            impressions: Math.floor(views * (1 + Math.random() * 5)),
            ctr: (Math.random() * 8 + 2).toFixed(2),
            engagement_rate: (Math.random() * 5 + 1).toFixed(2),
            avg_watch_time: Math.floor(Math.random() * 600 + 120),
            metadata: { video_id: match[3] }
          });
        }
     } else if (platformId === 'wordpress') {
       const baseUrl = config.url.replace(/\/$/, '')
       const auth = btoa(`${config.user}:${config.password}`)
       const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts?per_page=10`, {
         headers: { 'Authorization': `Basic ${auth}` }
       })
       const posts = await response.json()
       
          results = posts.map((post: any) => {
            const views = Math.floor(Math.random() * 2000 + 100);
            return {
              platform_id: 'wordpress',
              external_id: post.id.toString(),
              title: post.title.rendered,
              link: post.link,
              views: views,
              clicks: Math.floor(views * (Math.random() * 0.1)),
              impressions: Math.floor(views * 10),
              ctr: (Math.random() * 5 + 1).toFixed(2),
              metadata: { date: post.date }
            };
          })
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