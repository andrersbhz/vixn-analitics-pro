import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const GATEWAY = 'https://ai.gateway.lovable.dev/v1';

type ProductImage = { data: string; mimeType: string };

async function generateImage(prompt: string, refs: ProductImage[]): Promise<string> {
  const content: any[] = [{ type: 'text', text: prompt }];
  for (const img of refs) {
    content.push({ type: 'image_url', image_url: { url: `data:${img.mimeType};base64,${img.data}` } });
  }
  const res = await fetch(`${GATEWAY}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Lovable-API-Key': Deno.env.get('LOVABLE_API_KEY') ?? '',
    },
    body: JSON.stringify({
      model: 'google/gemini-3.1-flash-image',
      messages: [{ role: 'user', content }],
      modalities: ['image', 'text'],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`image ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new Error('sem imagem retornada');
  return `data:image/png;base64,${b64}`;
}

async function generateCopyPlan(productName: string, productDescription: string, niche: string) {
  const prompt = `Você é um copywriter de resposta direta. Produto: "${productName}". Descrição: "${productDescription}". Nicho/Contexto: "${niche || 'geral'}".
Retorne APENAS JSON puro (sem markdown) com esta forma:
{
  "creativeBriefs": [
    {"style":"Lifestyle","concept":"...","visualPrompt":"prompt em inglês curto para gerar a imagem do anúncio destacando o produto"},
    {"style":"Minimalista Premium","concept":"...","visualPrompt":"..."},
    {"style":"Prova Social / UGC","concept":"...","visualPrompt":"..."},
    {"style":"Oferta Impacto","concept":"...","visualPrompt":"..."}
  ],
  "adCopies": [
    {"platform":"Google Ads","headline":"","description":"","cta":""},
    {"platform":"Meta Ads (Instagram/Facebook)","headline":"","primaryText":"","cta":""},
    {"platform":"TikTok Ads","hook":"","script":"","cta":""},
    {"platform":"LinkedIn Ads","headline":"","body":"","cta":""}
  ]
}`;
  const res = await fetch(`${GATEWAY}/chat/completions`, {
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
  const json = await res.json();
  const text: string = json?.choices?.[0]?.message?.content ?? '{}';
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return { creativeBriefs: [], adCopies: [] };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { productName, productDescription, niche, images = [] } = await req.json();
    if (!productName || !productDescription) {
      return new Response(JSON.stringify({ error: 'productName e productDescription são obrigatórios' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const plan = await generateCopyPlan(productName, productDescription, niche || '');
    const briefs: Array<{ style: string; concept: string; visualPrompt: string }> = plan.creativeBriefs || [];

    const creatives = await Promise.all(
      briefs.slice(0, 4).map(async (b) => {
        const prompt = `${b.visualPrompt}. Produto: ${productName}. ${productDescription}. Estilo: ${b.style}. High-quality advertising creative, professional photography, sharp focus, e-commerce ready. Include the product prominently based on the reference image if provided.`;
        try {
          const url = await generateImage(prompt, images.slice(0, 2));
          return { ...b, imageUrl: url };
        } catch (e) {
          return { ...b, imageUrl: null, error: String((e as Error).message) };
        }
      })
    );

    return new Response(JSON.stringify({ creatives, adCopies: plan.adCopies || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});