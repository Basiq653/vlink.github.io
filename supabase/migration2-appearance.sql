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
