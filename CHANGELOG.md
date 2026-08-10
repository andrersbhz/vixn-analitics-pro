# Changelog

## 1.2.1 — 2026-08-10

### Authentication & Reliability
- Reconciled the 1.2.0 feature set with the latest authentication/RLS/JWT fixes.
- Owner-scoped (`user_id`) access for platform connections, platform items and sync history preserved.
- Edge functions keep requiring a valid JWT; 401 responses are handled gracefully in the client.
- Session-aware data loading avoids blank screens when the session is missing or expired.
- No backend, credential or integration changes; same connected database and project.

## 1.2.0 — 2026-08-10

### Market Intelligence
- Market Intelligence Pro with Executive Score, SWOT, Impact × Effort priorities, competitor comparison and 30/60/90 plans.
- Hardened URL analysis with validation, timeouts, private-network protection and structured AI output.
- Gemini as primary AI provider with OpenAI fallback; no Lovable AI gateway usage.

### Strategy Execution Suite
- Named visual strategy funnels with persistent editable stages.
- Operational Kanban with owners, priorities, deadlines, blocked/review/done workflow and overdue detection.
- Executive Cockpit with global completion, overdue work, high-priority work, stalled strategies and workload by owner.
- Monthly Calendar with filters by strategy, owner, status and priority.
- Persistent progress history snapshots with completion, overdue and blocked metrics.

### Security & Reliability
- Existing connection credentials are preserved server-side when settings are updated.
- AdSense OAuth redirect handling hardened without rotating existing credentials.
- `.env` files ignored for future commits and `.env.example` added.
- Manual GitHub Actions workflows added for Supabase functions and database migrations.
- Existing market analyses and working integrations remain preserved.

### Deployment
- Supabase database migrations remain manual and default to dry-run.
- Supabase Edge Function deployment remains manual.
- Required repository secrets are documented in the pull request.
