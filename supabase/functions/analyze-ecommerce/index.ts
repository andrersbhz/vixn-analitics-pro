const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: unknown, status = 200) => {
  const isApplicationError =
    !!body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'error');

  return new Response(JSON.stringify(body), {
    // The current frontend reads data.error after supabase.functions.invoke().
    // Returning 2xx for handled application errors preserves the real message
    // instead of Supabase replacing it with the generic non-2xx SDK error.
    status: isApplicationError ? 200 : status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

const stripCodeFence = (value: string) =>
  value.replace(/```json|```/gi, '').trim();

async function analyzeWithGemini(prompt: string, apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `Gemini retornou HTTP ${response.status}`;
    throw new Error(message);
  }

  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini não retornou conteúdo para a análise.');
  return text as string;
}

async function analyzeWithOpenAI(prompt: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Responda somente com JSON puro válido.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `OpenAI retornou HTTP ${response.status}`;
    throw new Error(message);
  }

  const text = payload?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI não retornou conteúdo para a análise.');
  return text as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      return jsonResponse({ error: 'URL inválida. Informe um link começando com http:// ou https://.' }, 400);
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return jsonResponse({ error: 'URL inválida.' }, 400);
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return jsonResponse({ error: 'Protocolo de URL não suportado.' }, 400);
    }

    let html = '';
    let sourceStatus = 200;
    try {
      const res = await fetch(parsedUrl.toString(), {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
      });

      sourceStatus = res.status;
      html = await res.text();

      if (!res.ok && !html) {
        return jsonResponse(
          { error: `O site respondeu HTTP ${res.status} e não forneceu conteúdo para análise.` },
          422,
        );
      }
    } catch (e) {
      return jsonResponse(
        { error: `Falha ao acessar a URL: ${e instanceof Error ? e.message : String(e)}` },
        502,
      );
    }

    const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '').trim();
    const desc = (
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] || ''
    ).trim();
    const ogDesc = (
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] || ''
    ).trim();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 12000);

    if (!title && !desc && !ogDesc && text.length < 80) {
      return jsonResponse(
        {
          error:
            'Não foi possível extrair conteúdo suficiente desse link. O site pode bloquear acessos automatizados ou exigir JavaScript para carregar a página.',
          sourceStatus,
        },
        422,
      );
    }

    const prompt = `Você é um analista de e-commerce e growth. Analise a loja abaixo e retorne APENAS JSON puro válido, sem markdown, com esta forma exata:
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

URL: ${parsedUrl.toString()}
STATUS HTTP DA FONTE: ${sourceStatus}
TÍTULO: ${title}
META DESCRIÇÃO: ${desc || ogDesc}
CONTEÚDO (extrato): ${text}`;

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const openAIKey = Deno.env.get('OPENAI_API_KEY');

    if (!geminiKey && !openAIKey) {
      return jsonResponse(
        {
          error:
            'Nenhuma chave de IA está configurada no backend. Configure GEMINI_API_KEY ou OPENAI_API_KEY nos secrets do Supabase.',
        },
        500,
      );
    }

    let raw = '';
    let provider = '';
    const providerErrors: string[] = [];

    if (geminiKey) {
      try {
        raw = await analyzeWithGemini(prompt, geminiKey);
        provider = 'gemini';
      } catch (error) {
        providerErrors.push(`Gemini: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (!raw && openAIKey) {
      try {
        raw = await analyzeWithOpenAI(prompt, openAIKey);
        provider = 'openai';
      } catch (error) {
        providerErrors.push(`OpenAI: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (!raw) {
      return jsonResponse(
        {
          error: 'Falha ao processar a análise com os provedores de IA configurados.',
          details: providerErrors,
        },
        502,
      );
    }

    let analysis: unknown;
    try {
      analysis = JSON.parse(stripCodeFence(raw));
    } catch {
      return jsonResponse(
        {
          error: 'A IA respondeu, mas o conteúdo não veio em JSON válido.',
          provider,
        },
        502,
      );
    }

    return jsonResponse({
      url: parsedUrl.toString(),
      title,
      description: desc || ogDesc,
      sourceStatus,
      provider,
      analysis,
    });
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});