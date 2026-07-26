import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { url } = await req.json();
    if (!url || !/^https?:\/\//i.test(url)) {
      return new Response(JSON.stringify({ error: 'URL inválida' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch HTML
    let html = '';
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SparkGrowthBot/1.0)' },
      });
      html = await res.text();
    } catch (e) {
      return new Response(JSON.stringify({ error: `Falha ao acessar a URL: ${(e as Error).message}` }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract basic signals
    const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '').trim();
    const desc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] || '').trim();
    const ogDesc = (html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] || '').trim();
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 6000);

    const prompt = `Você é um analista de e-commerce e growth. Analise a loja abaixo e retorne APENAS JSON puro (sem markdown) com esta forma exata:
{
  "storeName": "string",
  "niche": "string curto (nicho principal)",
  "positioning": "string",
  "targetAudience": "string",
  "productHighlights": ["string","string","string"],
  "pricePerception": "string",
  "strengths": ["string","string","string"],
  "weaknesses": ["string","string","string"],
  "opportunities": ["string","string","string"],
  "recommendedChannels": ["string"],
  "quickWins": ["string","string","string","string","string"]
}

URL: ${url}
TÍTULO: ${title}
META DESCRIÇÃO: ${desc || ogDesc}
CONTEÚDO (extrato): ${text}`;

    const gRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': Deno.env.get('LOVABLE_API_KEY') ?? '',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.5-flash',
        messages: [
          { role: 'system', content: 'Responda somente com JSON puro válido.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!gRes.ok) {
      const t = await gRes.text();
      return new Response(JSON.stringify({ error: `IA ${gRes.status}: ${t.slice(0, 200)}` }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const gJson = await gRes.json();
    const raw: string = gJson?.choices?.[0]?.message?.content ?? '{}';
    let analysis: any = {};
    try { analysis = JSON.parse(raw.replace(/```json|```/g, '').trim()); } catch { analysis = { raw }; }

    return new Response(JSON.stringify({ url, title, description: desc || ogDesc, analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});