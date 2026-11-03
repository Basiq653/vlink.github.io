-- Vlink: РїРѕР»РЅР°СЏ РјРёРіСЂР°С†РёСЏ Р±Р°Р·С‹ (profiles + link_cards)
-- Р’С‹РїРѕР»РЅРёС‚Рµ РІ Supabase Dashboard в†’ SQL Editor в†’ New query в†’ Run
-- (Р±РµР·РѕРїР°СЃРЅРѕ Р·Р°РїСѓСЃРєР°С‚СЊ РїРѕРІС‚РѕСЂРЅРѕ)

-- ============================================================
-- 1. РџР РћР¤РР›Р РџРћР›Р¬Р—РћР’РђРўР•Р›Р•Р™ (username, РёРјСЏ, Р°РІР°С‚Р°СЂ)
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null check (username ~ '^[a-zA-Z0-9_-]{3,24}$'),
  display_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- РїСЂРѕС„РёР»СЊ РїСѓР±Р»РёС‡РЅС‹Р№: Р»СЋР±РѕР№ РІРёРґРёС‚ РёРјРµРЅР° Рё Р°РґСЂРµСЃР° СЃС‚СЂР°РЅРёС† /u/<username>
drop policy if exists "Anyone can read profiles" on public.profiles;
create policy "Anyone can read profiles"
  on public.profiles
  for select
  using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- РђРІС‚РѕРїСЂРѕС„РёР»СЊ РїСЂРё СЂРµРіРёСЃС‚СЂР°С†РёРё: username = РёРјСЏ РёР· user_metadata ( sanitized ),
-- РїСЂРё РєРѕР»Р»РёР·РёРё РґРѕР±Р°РІР»СЏРµС‚СЃСЏ СЃСѓС„С„РёРєСЃ
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

-- С‚СЂРёРіРіРµСЂ СЃСЂР°Р±РѕС‚Р°РµС‚ РґР»СЏ РІСЃРµС… Р±СѓРґСѓС‰РёС… РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- РџСЂРѕС„РёР»СЊ СЃРѕР·РґР°СЃС‚СЃСЏ Рё РґР»СЏ С‚РµС…, РєС‚Рѕ СѓР¶Рµ Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°РЅ:
insert into public.profiles (id, username, display_name)
select
  u.id,
  'user' || substr(replace(u.id::text, '-', ''), 1, 12),
  coalesce(u.raw_user_meta_data->>'name', '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- ============================================================
-- 2. РљРђР РўРћР§РљР РЎРЎР«Р›РћРљ
-- ============================================================

create table if not exists public.link_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null default 'Other',
  icon text not null default 'рџ”—',
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.link_cards enable row level security;

-- С‡РёС‚Р°С‚СЊ РєР°С‚Р°Р»РѕРі РјРѕРіСѓС‚ РІСЃРµ (РїСѓР±Р»РёС‡РЅС‹Рµ СЃС‚СЂР°РЅРёС†С‹ /u/<username> Рё СЂР°Р·РґРµР» В«РЎСЃС‹Р»РєРёВ»)
drop policy if exists "Anyone can read link cards" on public.link_cards;
create policy "Anyone can read link cards"
  on public.link_cards
  for select
  using (true);

-- СЃРѕР·РґР°РІР°С‚СЊ/СЂРµРґР°РєС‚РёСЂРѕРІР°С‚СЊ/СѓРґР°Р»СЏС‚СЊ РјРѕР¶РЅРѕ С‚РѕР»СЊРєРѕ СЃРІРѕРё РєР°СЂС‚РѕС‡РєРё
drop policy if exists "Users can insert own cards" on public.link_cards;
create policy "Users can insert own cards"
  on public.link_cards
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own cards" on public.link_cards;
create policy "Users can update own cards"
  on public.link_cards
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own cards" on public.link_cards;
create policy "Users can delete own cards"
  on public.link_cards
  for delete
  using (auth.uid() = user_id);

-- Р±С‹СЃС‚СЂС‹Р№ РёРЅРґРµРєСЃ РґР»СЏ РїСЂРѕС„РёР»РµР№
create index if not exists link_cards_user_id_idx on public.link_cards (user_id);
-- ============================================================
-- 3. Р’РќР•РЁРќРР™ Р’РР” РџР РћР¤РР›РЇ (РІ СЃС‚РёР»Рµ guns.lol) + STORAGE
-- Р”РѕР±Р°РІСЊС‚Рµ СЌС‚РѕС‚ Р±Р»РѕРє Р’ РљРћРќР•Р¦ supabase/migration.sql
-- (РёР»Рё Р·Р°РїСѓСЃС‚РёС‚Рµ РѕС‚РґРµР»СЊРЅРѕ вЂ” Р±РµР·РѕРїР°СЃРЅРѕ РїРѕРІС‚РѕСЂСЏС‚СЊ)
-- ============================================================

-- РќРѕРІС‹Рµ РєРѕР»РѕРЅРєРё РїСЂРѕС„РёР»СЏ
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
-- STORAGE: РїСѓР±Р»РёС‡РЅС‹Р№ Р±Р°РєРµС‚ media (С„РѕРЅ, Р°РІР°С‚Р°СЂ, Р°СѓРґРёРѕ, РєСѓСЂСЃРѕСЂ)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- С‡РёС‚Р°С‚СЊ С„Р°Р№Р»С‹ РјРѕР¶РµС‚ anyone
drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
  on storage.objects
  for select
  using (bucket_id = 'media');

-- Р·Р°РіСЂСѓР¶Р°С‚СЊ/РѕР±РЅРѕРІР»СЏС‚СЊ/СѓРґР°Р»СЏС‚СЊ вЂ” С‚РѕР»СЊРєРѕ СЃРІРѕРё С„Р°Р№Р»С‹ (РїР°РїРєР° = СЃРІРѕР№ uid)
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
-- 4. Р­Р¤Р¤Р•РљРў РќРРљРђ РќРђ РџРЈР‘Р›РР§РќР«РҐ РЎРўР РђРќРР¦РђРҐ
-- Р—Р°РїСѓСЃС‚РёС‚Рµ РІ Supabase SQL Editor (Р±РµР·РѕРїР°СЃРЅРѕ РїРѕРІС‚РѕСЂСЏС‚СЊ).
-- (СЌС‚РѕС‚ Р¶Рµ Р±Р»РѕРє СѓР¶Рµ РґРѕР±Р°РІР»РµРЅ РІ РєРѕРЅРµС† migration.sql)
-- ============================================================

alter table public.profiles
  add column if not exists name_effect text not null default 'none'; -- none | rainbow | glow | glitch


-- =========================================================
-- 7. FX_COLOR — цвет частиц эффектов (снег / дождь / конфетти /
--    светлячки / пузыри). Раздел идемпотентный, запуск повторно безопасен.
-- =========================================================
alter table public.profiles add column if not exists fx_color text not null default '#ffffff';

-- =========================================================
-- 8. VERIFIED — чёрно-белая галочка у ника на странице /u/<username>
-- =========================================================
alter table public.profiles add column if not exists verified boolean not null default false;

