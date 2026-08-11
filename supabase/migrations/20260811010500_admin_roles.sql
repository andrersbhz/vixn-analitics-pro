create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create policy "Users can view own role"
on public.user_roles for select
to authenticated
using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_admin boolean;
begin
  select exists(select 1 from public.user_roles where role = 'admin') into has_admin;

  insert into public.user_roles(user_id, role)
  values (new.id, case when has_admin then 'user' else 'admin' end)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_role on auth.users;
create trigger on_auth_user_created_role
after insert on auth.users
for each row execute function public.handle_new_user_role();

-- Backfill: if users already exist, create role rows; first existing user becomes admin only when no admin exists.
do $$
declare
  first_user uuid;
begin
  insert into public.user_roles(user_id, role)
  select id, 'user' from auth.users
  on conflict (user_id) do nothing;

  if not exists (select 1 from public.user_roles where role = 'admin') then
    select id into first_user from auth.users order by created_at asc limit 1;
    if first_user is not null then
      update public.user_roles set role = 'admin', updated_at = now() where user_id = first_user;
    end if;
  end if;
end $$;
