const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ProductImage = { data: string; mimeType: string };

const cleanJson = (value: string) => value.replace(/```json|```/gi, '').trim();

async function generateImage(prompt: string, refs: ProductImage[], apiKey: string): Promise<string> {
  const parts: any[] = [{ text: prompt }];

  for (const img of refs) {
    parts.push({
      inline_data: {
        mime_type: img.mimeType,
        data: img.data,
      },
    });
  }

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1/models/gemini-3.1-flash-image:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ['IMAGE'],
          responseFormat: {
            image: {
              aspectRatio: '1:1',
              imageSize: '1K',
            },
          },
        },
      }),
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `Gemini Image retornou HTTP ${response.status}`;
    throw new Error(message);
  }

  const responseParts = payload?.candidates?.[0]?.content?.parts || [];
  const imagePart = responseParts.find((part: any) => part?.inlineData?.data || part?.inline_data?.data);
  const inlineData = imagePart?.inlineData || imagePart?.inline_data;

  if (!inlineData?.data) throw new Error('Gemini não retornou imagem.');
  return `data:${inlineData.mimeType || inlineData.mime_type || 'image/png'};base64,${inlineData.data}`;
}

async function generateCopyPlanWithGemini(
  prompt: string,
  apiKey: string,
): Promise<any> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      }),
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Gemini retornou HTTP ${response.status}`);
  }

  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini não retornou o plano de criativos.');
  return JSON.parse(cleanJson(text));
}

async function generateCopyPlanWithOpenAI(prompt: string, apiKey: string): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.4,
      messages: [
        { role: 'system', content: 'Responda somente com JSON puro válido.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || `OpenAI retornou HTTP ${response.status}`);
  }

  const text = payload?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI não retornou o plano de criativos.');
  return JSON.parse(cleanJson(text));
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

  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  const openAIKey = Deno.env.get('OPENAI_API_KEY');
  const errors: string[] = [];

  if (geminiKey) {
    try {
      return await generateCopyPlanWithGemini(prompt, geminiKey);
    } catch (error) {
      errors.push(`Gemini: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (openAIKey) {
    try {
      return await generateCopyPlanWithOpenAI(prompt, openAIKey);
    } catch (error) {
      errors.push(`OpenAI: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (!geminiKey && !openAIKey) {
    throw new Error('Configure GEMINI_API_KEY ou OPENAI_API_KEY nos secrets do Supabase.');
  }

  throw new Error(`Falha ao gerar plano de criativos. ${errors.join(' | ')}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { productName, productDescription, niche, images = [] } = await req.json();
    if (!productName || !productDescription) {
      return new Response(JSON.stringify({ error: 'productName e productDescription são obrigatórios' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const plan = await generateCopyPlan(productName, productDescription, niche || '');
    const briefs: Array<{ style: string; concept: string; visualPrompt: string }> = plan.creativeBriefs || [];
    const geminiKey = Deno.env.get('GEMINI_API_KEY');

    const creatives = await Promise.all(
      briefs.slice(0, 4).map(async (brief) => {
        const prompt = `${brief.visualPrompt}. Produto: ${productName}. ${productDescription}. Estilo: ${brief.style}. High-quality advertising creative, professional photography, sharp focus, e-commerce ready. Include the product prominently based on the reference image if provided.`;

        if (!geminiKey) {
          return {
            ...brief,
            imageUrl: null,
            error: 'GEMINI_API_KEY necessária para gerar imagens. Os textos foram gerados normalmente.',
          };
        }

        try {
          const url = await generateImage(prompt, images.slice(0, 2), geminiKey);
          return { ...brief, imageUrl: url };
        } catch (error) {
          return {
            ...brief,
            imageUrl: null,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),
    );

    return new Response(JSON.stringify({ creatives, adCopies: plan.adCopies || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});