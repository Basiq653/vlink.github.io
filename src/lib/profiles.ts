import { supabase } from './supabase';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  created_at: string;
}

export type ProfileDraft = Pick<Profile, 'username' | 'display_name'>;

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
