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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, model = 'gemini' } = await req.json()

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return jsonResponse({ error: 'Prompt obrigatório' }, 400)
    }

    if (model === 'gemini') {
      console.log('Gemini model selection, checking API Key...')
      const apiKey = Deno.env.get('GEMINI_API_KEY')

      if (!apiKey) {
        console.error('GEMINI_API_KEY is not configured')
        return jsonResponse({ error: 'Gemini não configurado no servidor' }, 500)
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Gemini API error', response.status, data?.error?.message ?? 'Unknown error')
        return jsonResponse({
          error: data?.error?.message || 'Erro ao processar com Gemini',
          provider: 'gemini',
        }, response.status)
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Erro ao processar com Gemini'
      return jsonResponse({ text })
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) {
      console.error('OPENAI_API_KEY is not configured')
      return jsonResponse({ error: 'OpenAI não configurada no servidor' }, 500)
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('OpenAI API error', response.status, data?.error?.message ?? 'Unknown error')
      return jsonResponse({
        error: data?.error?.message || 'Erro ao processar com OpenAI',
        provider: 'openai',
      }, response.status)
    }

    const text = data.choices?.[0]?.message?.content || 'Erro ao processar com OpenAI'
    return jsonResponse({ text })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('ai-chat unexpected error', message)
    return jsonResponse({ error: message }, 500)
  }
})
