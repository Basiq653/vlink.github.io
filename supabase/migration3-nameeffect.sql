-- ============================================================
-- 4. ЭФФЕКТ НИКА НА ПУБЛИЧНЫХ СТРАНИЦАХ
-- Запустите в Supabase SQL Editor (безопасно повторять).
-- (этот же блок уже добавлен в конец migration.sql)
-- ============================================================

alter table public.profiles
  add column if not exists name_effect text not null default 'none'; -- none | rainbow | glow | glitch
