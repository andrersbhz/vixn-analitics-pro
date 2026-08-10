create table if not exists public.strategy_progress_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  funnel_id uuid not null references public.strategy_funnels(id) on delete cascade,
  progress integer not null default 0 check (progress between 0 and 100),
  total_tasks integer not null default 0,
  completed_tasks integer not null default 0,
  overdue_tasks integer not null default 0,
  blocked_tasks integer not null default 0,
  recorded_at timestamptz not null default now()
);

create index if not exists strategy_progress_history_funnel_recorded_idx
  on public.strategy_progress_history(funnel_id, recorded_at desc);
create index if not exists strategy_progress_history_user_recorded_idx
  on public.strategy_progress_history(user_id, recorded_at desc);

alter table public.strategy_progress_history enable row level security;

create policy "Users can view own strategy progress history"
on public.strategy_progress_history for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own strategy progress history"
on public.strategy_progress_history for insert
to authenticated
with check (auth.uid() = user_id);

create or replace function public.capture_strategy_progress_snapshot(p_funnel_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_total integer;
  v_completed integer;
  v_overdue integer;
  v_blocked integer;
  v_progress integer;
  v_last public.strategy_progress_history%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.strategy_funnels
    where id = p_funnel_id and user_id = v_user_id
  ) then
    raise exception 'Strategy not found';
  end if;

  select
    count(*)::integer,
    count(*) filter (where status = 'done')::integer,
    count(*) filter (where due_date < current_date and status <> 'done')::integer,
    count(*) filter (where status = 'blocked')::integer
  into v_total, v_completed, v_overdue, v_blocked
  from public.strategy_tasks
  where funnel_id = p_funnel_id and user_id = v_user_id;

  v_progress := case when v_total = 0 then 0 else round((v_completed::numeric / v_total::numeric) * 100)::integer end;

  select * into v_last
  from public.strategy_progress_history
  where funnel_id = p_funnel_id and user_id = v_user_id
  order by recorded_at desc
  limit 1;

  if v_last.id is null
     or v_last.progress <> v_progress
     or v_last.total_tasks <> v_total
     or v_last.completed_tasks <> v_completed
     or v_last.overdue_tasks <> v_overdue
     or v_last.blocked_tasks <> v_blocked
     or v_last.recorded_at < now() - interval '24 hours' then
    insert into public.strategy_progress_history (
      user_id, funnel_id, progress, total_tasks, completed_tasks, overdue_tasks, blocked_tasks
    ) values (
      v_user_id, p_funnel_id, v_progress, v_total, v_completed, v_overdue, v_blocked
    );
  end if;
end;
$$;

grant execute on function public.capture_strategy_progress_snapshot(uuid) to authenticated;
