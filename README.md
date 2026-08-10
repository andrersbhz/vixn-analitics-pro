# VIXN Analytics Pro

Painel de analytics e growth com integrações para plataformas digitais, análise de mercado, relatórios e recursos de IA.

## Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database e Edge Functions)
- Gemini / OpenAI para recursos de IA

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Variáveis de ambiente do frontend

Use `.env.example` como referência. O arquivo `.env` local não deve ser versionado.

## Edge Functions e secrets

As funções em `supabase/functions` rodam no ambiente do Supabase e precisam ser implantadas no projeto Supabase para que alterações de backend entrem em produção. Alterar apenas o código no GitHub não substitui automaticamente uma Edge Function já publicada, a menos que exista um pipeline externo de deploy configurado.

Secrets usados pelas funções de IA:

- `GEMINI_API_KEY`
- `OPENAI_API_KEY` (fallback para funções compatíveis)

As funções de análise e geração de criativos não devem depender de créditos ou do gateway de IA do Lovable.
