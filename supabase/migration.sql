-- Vlink: полная миграция базы (profiles + link_cards)
-- Выполните в Supabase Dashboard → SQL Editor → New query → Run
-- (безопасно запускать повторно)

-- ============================================================
-- 1. ПРОФИЛИ ПОЛЬЗОВАТЕЛЕЙ (username, имя, аватар)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null check (username ~ '^[a-zA-Z0-9_-]{3,24}$'),
  display_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- профиль публичный: любой видит имена и адреса страниц /u/<username>
create policy "Anyone can read profiles"
  on public.profiles
  for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Автопрофиль при регистрации: username = имя из user_metadata ( sanitized ),
-- при коллизии добавляется суффикс
create or replace function public.handle_new_user()
returns trigger
security definer
language plpgsql
as $$
declare
  base text;
  candidate text;
  suffix int := 0;
begin
  base := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'user'),
    '[^a-zA-Z0-9_-]', '', 'g'
  ));
  if base is null or char_length(base) < 3 then
    base := 'user' || substr(new.id::text, 1, 4);
  end if;
  if base !~ '^[a-zA-Z0-9_-]{3,24}$' then
    base := 'user' || substr(new.id::text, 1, 4);
  end if;
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    suffix := suffix + 1;
    candidate := base || suffix::text;
  end loop;
  insert into public.profiles (id, username, display_name)
  values (new.id, candidate, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

-- триггер сработает для всех будущих пользователей
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Профиль создастся и для тех, кто уже зарегистрирован:
insert into public.profiles (id, username, display_name)
select
  u.id,
  'user' || substr(replace(u.id::text, '-', ''), 1, 12),
  coalesce(u.raw_user_meta_data->>'name', '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- ============================================================
-- 2. КАРТОЧКИ ССЫЛОК
-- ============================================================

create table if not exists public.link_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null default 'Other',
  icon text not null default '🔗',
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.link_cards enable row level security;

-- читать каталог могут все (публичные страницы /u/<username> и раздел «Ссылки»)
create policy "Anyone can read link cards"
  on public.link_cards
  for select
  using (true);

-- создавать/редактировать/удалять можно только свои карточки
create policy "Users can insert own cards"
  on public.link_cards
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cards"
  on public.link_cards
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cards"
  on public.link_cards
  for delete
  using (auth.uid() = user_id);

-- быстрый индекс для профилей
create index if not exists link_cards_user_id_idx on public.link_cards (user_id);
-- ============================================================
-- 3. ВНЕШНИЙ ВИД ПРОФИЛЯ (в стиле guns.lol) + STORAGE
-- Добавьте этот блок В КОНЕЦ supabase/migration.sql
-- (или запустите отдельно — безопасно повторять)
-- ============================================================

-- Новые колонки профиля
alter table public.profiles
  add column if not exists description  text not null default '',
  add column if not exists avatar_url   text not null default '',
  add column if not exists background_url text not null default '',
  add column if not exists audio_url    text not null default '',
  add column if not exists cursor_url   text not null default '',
  add column if not exists bg_effect    text not null default 'none', -- none | rain | snow | stars
  add column if not exists bg_opacity   int not null default 100,     -- 10..100 (%)
  add column if not exists bg_blur      int not null default 0,       -- 0..80 (px)
  add column if not exists location     text not null default '',
  add column if not exists accent_color text not null default '#4f9eff',
  add column if not exists text_color   text not null default '#e9eef4',
  add column if not exists bg_color     text not null default '#080c14',
  add column if not exists icons_color  text not null default '#4f9eff';

-- ============================================================
-- STORAGE: публичный бакет media (фон, аватар, аудио, курсор)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- читать файлы может anyone
drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
  on storage.objects
  for select
  using (bucket_id = 'media');

-- загружать/обновлять/удалять — только свои файлы (папка = свой uid)
drop policy if exists "Users upload own media" on storage.objects;
create policy "Users upload own media"
  on storage.objects
  for insert
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own media" on storage.objects;
create policy "Users update own media"
  on storage.objects
  for update
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own media" on storage.objects;
create policy "Users delete own media"
  on storage.objects
  for delete
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 4. ЭФФЕКТ НИКА НА ПУБЛИЧНЫХ СТРАНИЦАХ
-- Запустите в Supabase SQL Editor (безопасно повторять).
-- (этот же блок уже добавлен в конец migration.sql)
-- ============================================================

alter table public.profiles
  add column if not exists name_effect text not null default 'none'; -- none | rainbow | glow | glitch

