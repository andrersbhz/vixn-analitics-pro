insert into public.platform_connections (id, name, is_connected, config, user_id)
select 'openai', 'OpenAI', false, '{}'::jsonb, (select user_id from public.platform_connections where user_id is not null limit 1)
where not exists (select 1 from public.platform_connections where id = 'openai');

insert into public.platform_connections (id, name, is_connected, config, user_id)
select 'gemini', 'Google Gemini', false, '{}'::jsonb, (select user_id from public.platform_connections where user_id is not null limit 1)
where not exists (select 1 from public.platform_connections where id = 'gemini');