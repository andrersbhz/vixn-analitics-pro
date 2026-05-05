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
 
     if (platformId === 'youtube') {
       const channelId = config.id
       if (!channelId) throw new Error('ID do Canal YouTube não configurado')
 
       const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
       const response = await fetch(rssUrl)
       const xml = await response.text()
 
       // Simple XML parsing for entries
       const entries = xml.matchAll(/<entry>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link rel="alternate" href="(.*?)"\/>[\s\S]*?<yt:videoId>(.*?)<\/yt:videoId>[\s\S]*?<\/entry>/g)
       
       for (const match of entries) {
         results.push({
           platform_id: 'youtube',
           external_id: match[3],
           title: match[1],
           link: match[2],
           metadata: { video_id: match[3] }
         })
       }
     } else if (platformId === 'wordpress') {
       const baseUrl = config.url.replace(/\/$/, '')
       const auth = btoa(`${config.user}:${config.password}`)
       const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts?per_page=10`, {
         headers: { 'Authorization': `Basic ${auth}` }
       })
       const posts = await response.json()
       
       results = posts.map((post: any) => ({
         platform_id: 'wordpress',
         external_id: post.id.toString(),
         title: post.title.rendered,
         link: post.link,
         metadata: { date: post.date }
       }))
     }
 
     // Upsert results into platform_items
     if (results.length > 0) {
       const { error: upsertError } = await supabaseClient
         .from('platform_items')
         .upsert(results, { onConflict: 'platform_id,external_id' })
 
       if (upsertError) throw upsertError
     }
 
     // Update connection status
     await supabaseClient
       .from('platform_connections')
       .update({ 
         last_sync_at: new Date().toISOString(),
         is_connected: true 
       })
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