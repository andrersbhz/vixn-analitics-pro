const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (body: unknown, status = 200) => {
  const isApplicationError =
    !!body && typeof body === 'object' && Object.prototype.hasOwnProperty.call(body, 'error');

  return new Response(JSON.stringify(body), {
    status: isApplicationError ? 200 : status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

const stripCodeFence = (value: string) => value.replace(/```json|```/gi, '').trim();

function isPrivateHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;
  if (host === '0.0.0.0' || host === '::1') return true;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }

  return host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80:');
}

async function readLimitedText(response: Response, maxBytes = 1_500_000) {
  if (!response.body) return '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let output = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      output += decoder.decode(value.slice(0, Math.max(0, value.byteLength - (total - maxBytes))), { stream: true });
      await reader.cancel();
      break;
    }
    output += decoder.decode(value, { stream: true });
  }

  output += decoder.decode();
  return output;
}

async function analyzeWithGemini(prompt: string, apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(45000),
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
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Responda somente com JSON puro válido, sem inventar dados que não possam ser inferidos da página.' },
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

    if (isPrivateHost(parsedUrl.hostname)) {
      return jsonResponse({ error: 'URLs locais, privadas ou internas não são permitidas.' }, 400);
    }

    let html = '';
    let sourceStatus = 200;
    let finalUrl = parsedUrl.toString();
    let contentType = '';

    try {
      const res = await fetch(parsedUrl.toString(), {
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        },
      });

      sourceStatus = res.status;
      finalUrl = res.url || finalUrl;
      contentType = res.headers.get('content-type') || '';

      const finalParsed = new URL(finalUrl);
      if (isPrivateHost(finalParsed.hostname)) {
        return jsonResponse({ error: 'O endereço redirecionou para uma URL privada ou interna e foi bloqueado.' }, 400);
      }

      if (contentType && !/(text\/html|application\/xhtml\+xml|text\/plain)/i.test(contentType)) {
        return jsonResponse({ error: `Tipo de conteúdo não suportado para análise: ${contentType.split(';')[0]}.` }, 422);
      }

      html = await readLimitedText(res);

      if (!res.ok && !html) {
        return jsonResponse({ error: `O site respondeu HTTP ${res.status} e não forneceu conteúdo para análise.` }, 422);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return jsonResponse({ error: `Falha ao acessar a URL: ${message}` }, 502);
    }

    const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '').trim();
    const desc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] || '').trim();
    const ogDesc = (html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] || '').trim();
    const canonical = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || '').trim();
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
      return jsonResponse({
        error: 'Não foi possível extrair conteúdo suficiente desse link. O site pode bloquear acessos automatizados ou exigir JavaScript para carregar a página.',
        sourceStatus,
      }, 422);
    }

    const technicalSignals = {
      hasTitle: Boolean(title),
      hasMetaDescription: Boolean(desc),
      hasOpenGraph: /property=["']og:/i.test(html),
      hasCanonical: Boolean(canonical),
      hasViewport: /name=["']viewport["']/i.test(html),
      hasJsonLd: /application\/ld\+json/i.test(html),
      hasRobotsMeta: /name=["']robots["']/i.test(html),
      textLength: text.length,
    };

    const prompt = `Você é um analista sênior de e-commerce, growth, CRO e posicionamento digital. Analise somente os sinais fornecidos da página. Não invente faturamento, tráfego, conversão, CAC ou dados financeiros não presentes. Quando algo não puder ser inferido, deixe isso claro. Retorne APENAS JSON puro válido, sem markdown, com esta forma exata:
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
  "quickWins": ["string","string","string","string","string"],
  "croRecommendations": ["string","string","string"],
  "seoRecommendations": ["string","string","string"],
  "trustSignals": ["string"],
  "risks": ["string"],
  "confidence": "alta|media|baixa",
  "confidenceReason": "string"
}

URL SOLICITADA: ${parsedUrl.toString()}
URL FINAL: ${finalUrl}
STATUS HTTP DA FONTE: ${sourceStatus}
TÍTULO: ${title}
META DESCRIÇÃO: ${desc || ogDesc}
CANONICAL: ${canonical}
SINAIS TÉCNICOS: ${JSON.stringify(technicalSignals)}
CONTEÚDO (extrato): ${text}`;

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const openAIKey = Deno.env.get('OPENAI_API_KEY');

    if (!geminiKey && !openAIKey) {
      return jsonResponse({ error: 'Nenhuma chave de IA está configurada no backend. Configure GEMINI_API_KEY ou OPENAI_API_KEY nos secrets do Supabase.' }, 500);
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
      return jsonResponse({
        error: 'Falha ao processar a análise com os provedores de IA configurados.',
        details: providerErrors,
      }, 502);
    }

    let analysis: unknown;
    try {
      analysis = JSON.parse(stripCodeFence(raw));
    } catch {
      return jsonResponse({ error: 'A IA respondeu, mas o conteúdo não veio em JSON válido.', provider }, 502);
    }

    return jsonResponse({
      url: parsedUrl.toString(),
      finalUrl,
      title,
      description: desc || ogDesc,
      sourceStatus,
      contentType,
      provider,
      analyzedAt: new Date().toISOString(),
      technicalSignals,
      analysis,
    });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});