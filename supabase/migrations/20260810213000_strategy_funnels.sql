-- Named strategy funnels with persistent execution stages.
-- Additive migration: existing market_analyses data remains untouched.

create table if not exists public.strategy_funnels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  market_analysis_id uuid references public.market_analyses(id) on delete set null,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','active','paused','completed')),
  source_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists strategy_funnels_user_market_analysis_uidx
  on public.strategy_funnels(user_id, market_analysis_id)
  where market_analysis_id is not null;

create index if not exists strategy_funnels_user_updated_idx
  on public.strategy_funnels(user_id, updated_at desc);

create table if not exists public.strategy_funnel_stages (
  id uuid primary key default gen_random_uuid(),
  funnel_id uuid not null references public.strategy_funnels(id) on delete cascade,
  title text not null,
  stage_type text not null default 'custom',
  position integer not null default 0,
  objective text,
  channels text[] not null default '{}'::text[],
  content text,
  offer text,
  copy text,
  kpi text,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','blocked')),
  owner text,
  due_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(funnel_id, position)
);

create index if not exists strategy_funnel_stages_funnel_position_idx
  on public.strategy_funnel_stages(funnel_id, position);

alter table public.strategy_funnels enable row level security;
alter table public.strategy_funnel_stages enable row level security;

drop policy if exists "Users can view own strategy funnels" on public.strategy_funnels;
create policy "Users can view own strategy funnels"
  on public.strategy_funnels for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own strategy funnels" on public.strategy_funnels;
create policy "Users can create own strategy funnels"
  on public.strategy_funnels for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own strategy funnels" on public.strategy_funnels;
create policy "Users can update own strategy funnels"
  on public.strategy_funnels for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own strategy funnels" on public.strategy_funnels;
create policy "Users can delete own strategy funnels"
  on public.strategy_funnels for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can view own strategy stages" on public.strategy_funnel_stages;
create policy "Users can view own strategy stages"
  on public.strategy_funnel_stages for select
  using (exists (
    select 1 from public.strategy_funnels f
    where f.id = funnel_id and f.user_id = auth.uid()
  ));

drop policy if exists "Users can create own strategy stages" on public.strategy_funnel_stages;
create policy "Users can create own strategy stages"
  on public.strategy_funnel_stages for insert
  with check (exists (
    select 1 from public.strategy_funnels f
    where f.id = funnel_id and f.user_id = auth.uid()
  ));

drop policy if exists "Users can update own strategy stages" on public.strategy_funnel_stages;
create policy "Users can update own strategy stages"
  on public.strategy_funnel_stages for update
  using (exists (
    select 1 from public.strategy_funnels f
    where f.id = funnel_id and f.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.strategy_funnels f
    where f.id = funnel_id and f.user_id = auth.uid()
  ));

drop policy if exists "Users can delete own strategy stages" on public.strategy_funnel_stages;
create policy "Users can delete own strategy stages"
  on public.strategy_funnel_stages for delete
  using (exists (
    select 1 from public.strategy_funnels f
    where f.id = funnel_id and f.user_id = auth.uid()
  ));
