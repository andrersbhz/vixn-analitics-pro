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

## Credenciais de integrações

Credenciais sensíveis já armazenadas no Supabase devem ser preservadas. O frontend recebe apenas configurações sanitizadas, e atualizações de conexões são mescladas no backend pela Edge Function `connections-update`, evitando que tokens OAuth, senhas de aplicativo ou outros segredos sejam apagados ao salvar configurações não relacionadas.

Para colocar a atual rodada de correções em produção, publique pelo menos estas funções no Supabase:

- `ai-chat`
- `analyze-ecommerce`
- `generate-creatives`
- `connections-update`
- `connections-status`
- `adsense-oauth-start`
- `adsense-oauth-callback`

O projeto Supabase configurado no repositório é `orifwrskrtafulrmckhw`.

## Status das integrações

- Google AdSense: integração OAuth e sincronização real existentes.
- YouTube: sincronização pública por Channel ID/RSS existente.
- WordPress: sincronização REST existente, com suporte a senha de aplicativo e modo Jetpack.
- Facebook Ads: a interface atual possui cadastro do Ad Account ID, mas a sincronização Meta Graph API ainda não está implementada. A página `FacebookAds` contém dados demonstrativos e não deve ser tratada como fonte de métricas reais até a integração Meta ser concluída.
