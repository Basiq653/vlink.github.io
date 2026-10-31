import { supabase } from './supabase';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  created_at: string;
  // внешний вид (guns.lol style)
  description: string;
  avatar_url: string;
  background_url: string;
  audio_url: string;
  cursor_url: string;
  bg_effect: string; // none | rain | snow | stars
  bg_opacity: number; // 10..100
  bg_blur: number; // 0..80
  location: string;
  accent_color: string;
  text_color: string;
  bg_color: string;
  icons_color: string;
}

export type ProfileDraft = Pick<Profile, 'username' | 'display_name'>;

export type AppearanceDraft = {
  description: string;
  avatar_url: string;
  background_url: string;
  audio_url: string;
  cursor_url: string;
  bg_effect: string;
  bg_opacity: number;
  bg_blur: number;
  location: string;
  accent_color: string;
  text_color: string;
  bg_color: string;
  icons_color: string;
};

export const APPEARANCE_FALLBACK: AppearanceDraft = {
  description: '',
  avatar_url: '',
  background_url: '',
  audio_url: '',
  cursor_url: '',
  bg_effect: 'none',
  bg_opacity: 100,
  bg_blur: 0,
  location: '',
  accent_color: '#4f9eff',
  text_color: '#e9eef4',
  bg_color: '#080c14',
  icons_color: '#4f9eff',
};

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;

function colorOr(value: string, fallback: string): string {
  return HEX_RE.test(value) ? value : fallback;
}

export function appearanceFrom(profile: Profile | null): AppearanceDraft {
  if (!profile) return { ...APPEARANCE_FALLBACK };
  return {
    description: profile.description ?? '',
    avatar_url: profile.avatar_url ?? '',
    background_url: profile.background_url ?? '',
    audio_url: profile.audio_url ?? '',
    cursor_url: profile.cursor_url ?? '',
    bg_effect: profile.bg_effect ?? 'none',
    bg_opacity: typeof profile.bg_opacity === 'number' ? profile.bg_opacity : 100,
    bg_blur: typeof profile.bg_blur === 'number' ? profile.bg_blur : 0,
    location: profile.location ?? '',
    accent_color: colorOr(profile.accent_color ?? '', APPEARANCE_FALLBACK.accent_color),
    text_color: colorOr(profile.text_color ?? '', APPEARANCE_FALLBACK.text_color),
    bg_color: colorOr(profile.bg_color ?? '', APPEARANCE_FALLBACK.bg_color),
    icons_color: colorOr(profile.icons_color ?? '', APPEARANCE_FALLBACK.icons_color),
  };
}

export async function fetchProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) {
    console.warn('Failed to load profile:', error.message);
    return null;
  }
  return (data as Profile) ?? null;
}

export async function fetchProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .maybeSingle();
  if (error) {
    console.warn('Failed to load profile:', error.message);
    return null;
  }
  return (data as Profile) ?? null;
}

export async function updateOwnProfile(draft: ProfileDraft): Promise<{ ok: boolean; message?: string }> {
  const username = draft.username.trim().toLowerCase();
  if (!/^[a-zA-Z0-9_-]{3,24}$/.test(username)) {
    return { ok: false, message: 'Адрес: 3–24 символа, только латиница, цифры, дефис и подчёркивание.' };
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: 'Войдите в аккаунт.' };

  const { error } = await supabase.from('profiles').upsert({
    id: auth.user.id,
    username,
    display_name: draft.display_name.trim(),
  });

  if (error) {
    if (error.message.includes('duplicate key') || error.code === '23505') {
      return { ok: false, message: 'Этот адрес уже занят. Попробуйте другой.' };
    }
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function updateOwnAppearance(draft: AppearanceDraft): Promise<{ ok: boolean; message?: string }> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, message: 'Войдите в аккаунт.' };

  const payload = {
    description: draft.description.slice(0, 160),
    avatar_url: draft.avatar_url,
    background_url: draft.background_url,
    audio_url: draft.audio_url,
    cursor_url: draft.cursor_url,
    bg_effect: ['none', 'rain', 'snow', 'stars'].includes(draft.bg_effect) ? draft.bg_effect : 'none',
    bg_opacity: Math.min(100, Math.max(10, Math.round(draft.bg_opacity))),
    bg_blur: Math.min(80, Math.max(0, Math.round(draft.bg_blur))),
    location: draft.location.slice(0, 48),
    accent_color: colorOr(draft.accent_color, APPEARANCE_FALLBACK.accent_color),
    text_color: colorOr(draft.text_color, APPEARANCE_FALLBACK.text_color),
    bg_color: colorOr(draft.bg_color, APPEARANCE_FALLBACK.bg_color),
    icons_color: colorOr(draft.icons_color, APPEARANCE_FALLBACK.icons_color),
  };

  const { error } = await supabase.from('profiles').update(payload).eq('id', auth.user.id);
  if (error) {
    const missingColumn = error.message.includes('column') && error.message.includes('does not exist');
    if (missingColumn) {
      return { ok: false, message: 'Новые колонки ещё не добавлены — запустите migration2-appearance.sql в SQL Editor.' };
    }
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
