-- Operational tasks linked to strategy funnels and stages.
-- Additive migration: does not modify or delete existing funnel/history data.

create table if not exists public.strategy_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  funnel_id uuid not null references public.strategy_funnels(id) on delete cascade,
  stage_id uuid references public.strategy_funnel_stages(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','doing','review','done','blocked')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  owner text,
  due_date date,
  completed_at timestamptz,
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists strategy_tasks_user_idx on public.strategy_tasks(user_id);
create index if not exists strategy_tasks_funnel_status_idx on public.strategy_tasks(funnel_id, status, position);
create index if not exists strategy_tasks_stage_idx on public.strategy_tasks(stage_id);
create index if not exists strategy_tasks_due_idx on public.strategy_tasks(due_date) where due_date is not null;

alter table public.strategy_tasks enable row level security;

drop policy if exists "Users can view own strategy tasks" on public.strategy_tasks;
create policy "Users can view own strategy tasks"
  on public.strategy_tasks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create own strategy tasks" on public.strategy_tasks;
create policy "Users can create own strategy tasks"
  on public.strategy_tasks for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.strategy_funnels f
      where f.id = funnel_id and f.user_id = auth.uid()
    )
  );

drop policy if exists "Users can update own strategy tasks" on public.strategy_tasks;
create policy "Users can update own strategy tasks"
  on public.strategy_tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own strategy tasks" on public.strategy_tasks;
create policy "Users can delete own strategy tasks"
  on public.strategy_tasks for delete
  using (auth.uid() = user_id);

-- Seed one actionable task for each existing stage when that stage does not yet have tasks.
insert into public.strategy_tasks (
  user_id, funnel_id, stage_id, title, description, status, priority, owner, due_date, position, metadata
)
select
  f.user_id,
  s.funnel_id,
  s.id,
  coalesce(nullif(s.objective, ''), 'Executar ' || s.title),
  concat_ws(E'\n',
    case when coalesce(s.content, '') <> '' then 'Conteúdo: ' || s.content end,
    case when coalesce(s.offer, '') <> '' then 'Oferta: ' || s.offer end,
    case when coalesce(s.copy, '') <> '' then 'Copy: ' || s.copy end,
    case when coalesce(s.kpi, '') <> '' then 'KPI: ' || s.kpi end
  ),
  case s.status
    when 'completed' then 'done'
    when 'in_progress' then 'doing'
    when 'blocked' then 'blocked'
    else 'todo'
  end,
  'medium',
  nullif(s.owner, ''),
  s.due_date,
  0,
  jsonb_build_object('seeded_from_stage', true)
from public.strategy_funnel_stages s
join public.strategy_funnels f on f.id = s.funnel_id
where not exists (
  select 1 from public.strategy_tasks t where t.stage_id = s.id
);
