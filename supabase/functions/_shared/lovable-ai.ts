// Cliente do gateway de IA nativo da plataforma (não depende de chaves do usuário).
const GATEWAY = 'https://ai.gateway.lovable.dev/v1';

export const LOVABLE_TEXT_MODEL = 'google/gemini-3.8-flash';
export const LOVABLE_IMAGE_MODEL = 'google/gemini-3-pro-image';

export function hasLovableAi() {
  return Boolean(Deno.env.get('LOVABLE_API_KEY'));
}

export async function callLovableText({
  prompt,
  systemPrompt = '',
  responseFormat = 'text',
  temperature = 0.4,
  model = LOVABLE_TEXT_MODEL,
}: {
  prompt: string;
  systemPrompt?: string;
  responseFormat?: 'text' | 'json';
  temperature?: number;
  model?: string;
}): Promise<string> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('LOVABLE_API_KEY não configurada no servidor');

  const response = await fetch(`${GATEWAY}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Lovable-API-Key': apiKey,
      'X-Lovable-AIG-SDK': 'fetch',
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      ...(responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || data?.message || `IA da plataforma retornou HTTP ${response.status}`;
    throw new Error(message);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('IA da plataforma não retornou conteúdo');
  return String(text);
}

export async function callLovableImage(prompt: string, model = LOVABLE_IMAGE_MODEL): Promise<string> {
  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) throw new Error('LOVABLE_API_KEY não configurada no servidor');

  const response = await fetch(`${GATEWAY}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Lovable-API-Key': apiKey,
      'X-Lovable-AIG-SDK': 'fetch',
    },
    body: JSON.stringify({ model, prompt, n: 1 }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || data?.message || `Geração de imagem retornou HTTP ${response.status}`;
    throw new Error(message);
  }

  const item = data?.data?.[0];
  const url = item?.url || (item?.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
  if (!url) throw new Error('IA da plataforma não retornou imagem');
  return url;
}
