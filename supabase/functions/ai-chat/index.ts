import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

type RequestBody = {
  prompt?: string
  model?: 'gemini' | 'openai'
  system_prompt?: string
  response_format?: 'text' | 'json'
  fallback?: boolean
  temperature?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json() as RequestBody
    const rawPrompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''
    const preferredModel = body.model === 'openai' ? 'openai' : 'gemini'
    const systemPrompt = typeof body.system_prompt === 'string' ? body.system_prompt.trim() : ''

    if (!rawPrompt) return jsonResponse({ error: 'Prompt obrigatório' }, 400)

    const prompt = applyProfessionalGuardrails(rawPrompt)
    const wantsStructuredJson = /\bjson\b/i.test(`${systemPrompt}\n${prompt}`)
      && /(json puro|objeto json|apenas (o )?json|somente (o )?json|estrutura exata)/i.test(`${systemPrompt}\n${prompt}`)
    const responseFormat: 'text' | 'json' = body.response_format === 'json' || wantsStructuredJson ? 'json' : 'text'
    const allowFallback = body.fallback !== false
    const temperature = Number.isFinite(body.temperature)
      ? Math.max(0, Math.min(1, Number(body.temperature)))
      : responseFormat === 'json' ? 0.2 : 0.5

    const providers: Array<'gemini' | 'openai'> = allowFallback
      ? preferredModel === 'gemini' ? ['gemini', 'openai'] : ['openai', 'gemini']
      : [preferredModel]

    const errors: Array<{ provider: string; error: string }> = []

    for (const provider of providers) {
      try {
        const text = provider === 'gemini'
          ? await callGemini({ prompt, systemPrompt, responseFormat, temperature })
          : await callOpenAI({ prompt, systemPrompt, responseFormat, temperature })

        return jsonResponse({
          text,
          provider,
          response_format: responseFormat,
          fallback_used: provider !== preferredModel,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`${provider} error:`, message)
        errors.push({ provider, error: message })
      }
    }

    return jsonResponse({
      error: 'Nenhum provedor de IA conseguiu concluir a solicitação.',
      details: errors,
    }, 502)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('ai-chat unexpected error', message)
    return jsonResponse({ error: message }, 500)
  }
})

function applyProfessionalGuardrails(prompt: string) {
  const isMarketStudy = /(análise de mercado|analise de mercado|market size|competitividade|avgcac|salesfunnel)/i.test(prompt)
  if (!isMarketStudy) return prompt

  return `${prompt}\n\nREGRAS DE QUALIDADE E CONFIABILIDADE:\n- Não apresente tamanho de mercado, CAC, crescimento, participação, receita ou projeções como fatos quando esses dados não tiverem sido fornecidos no contexto.\n- Quando precisar estimar, use faixas ou cenários plausíveis e identifique explicitamente como estimativa/premissa dentro dos campos de texto já existentes.\n- Diferencie observações inferíveis de hipóteses estratégicas.\n- Priorize recomendações acionáveis, específicas e mensuráveis.\n- Não invente fontes, pesquisas, percentuais ou benchmarks atribuídos a terceiros.\n- Em projections, trate os valores como índice de evolução relativo (base 100) quando não houver dados financeiros de entrada, evitando sugerir faturamento real.\n- Em distribution, garanta que os valores somem 100 e represente uma recomendação de mix de aquisição, não participação de mercado observada.\n- Em budget e KPI, use recomendações iniciais condicionais e deixe claro no texto quando dependem de validação por teste.\n- Preserve rigorosamente a estrutura JSON solicitada pelo usuário.`
}

async function callGemini({
  prompt,
  systemPrompt,
  responseFormat,
  temperature,
}: {
  prompt: string
  systemPrompt: string
  responseFormat: 'text' | 'json'
  temperature: number
}) {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada no servidor')

  const requestBody: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      ...(responseFormat === 'json' ? { responseMimeType: 'application/json' } : {}),
    },
  }

  if (systemPrompt) requestBody.systemInstruction = { parts: [{ text: systemPrompt }] }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(45000),
      body: JSON.stringify(requestBody),
    },
  )

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error?.message || `Gemini retornou HTTP ${response.status}`)

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini não retornou conteúdo')
  return String(text)
}

async function callOpenAI({
  prompt,
  systemPrompt,
  responseFormat,
  temperature,
}: {
  prompt: string
  systemPrompt: string
  responseFormat: 'text' | 'json'
  temperature: number
}) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) throw new Error('OPENAI_API_KEY não configurada no servidor')

  const messages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    { role: 'user', content: prompt },
  ]

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature,
      ...(responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {}),
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error?.message || `OpenAI retornou HTTP ${response.status}`)

  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenAI não retornou conteúdo')
  return String(text)
}
