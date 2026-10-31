import { supabase } from './supabase';

export type MediaKind = 'background' | 'audio' | 'avatar' | 'cursor';

const FOLDER_BY_KIND: Record<MediaKind, string> = {
  background: 'background',
  audio: 'audio',
  avatar: 'avatar',
  cursor: 'cursor',
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MiB

/**
 * Загружает файл пользователя в бакет media (публичное чтение).
 * Возвращает публичный URL файла.
 */
export async function uploadMedia(file: File, kind: MediaKind): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error('Файл больше 8 МБ.');
  }

  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) throw new Error('Войдите в аккаунт, чтобы загружать файлы.');

  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const path = `${uid}/${FOLDER_BY_KIND[kind]}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) {
    if (error.message.toLowerCase().includes('bucket')) {
      throw new Error('Бакет media ещё не создан — запустите SQL-миграцию (секция storage).');
    }
    throw error;
  }

  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}
