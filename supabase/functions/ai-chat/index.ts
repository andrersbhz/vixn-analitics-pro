import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, model = 'gemini' } = await req.json()
    
    if (model === 'gemini') {
      console.log('Gemini model selection, checking API Key...');
      const apiKey = Deno.env.get('GEMINI_API_KEY')
      if (!apiKey) {
        console.error('GEMINI_API_KEY not found in environment');
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY missing' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Calling Google Generative Language API...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google API error:', errorData);
        return new Response(JSON.stringify({ error: 'Google API error', details: errorData }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json()
      console.log('Google API response received successfully');
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao processar com Gemini"
      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      // OpenAI integration
      const apiKey = Deno.env.get('OPENAI_API_KEY')
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
      const text = data.choices?.[0]?.message?.content || "Erro ao processar com OpenAI"
      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})