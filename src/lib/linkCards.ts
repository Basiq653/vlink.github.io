import { supabase } from './supabase';

export interface LinkCard {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  url: string;
  created_at: string;
}

export type LinkCardDraft = Pick<LinkCard, 'title' | 'description' | 'category' | 'icon' | 'url'>;

export const CARD_CATEGORIES = ['Social', 'Dev', 'Design', 'Other'];

const TABLE = 'link_cards';

/** Public catalogue: everyone can read all cards. */
export async function fetchLinkCards(): Promise<{ cards: LinkCard[]; missingTable: boolean }> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
      // таблица ещё не создана — migration.sql не выполнен
      return { cards: [], missingTable: true };
    }
    console.warn('Failed to load link cards:', error.message);
    return { cards: [], missingTable: false };
  }
  return { cards: (data ?? []) as LinkCard[], missingTable: false };
}

export async function createLinkCard(draft: LinkCardDraft): Promise<LinkCard> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Войдите в аккаунт, чтобы добавлять ссылки.');

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...draft, user_id: auth.user.id })
    .select()
    .single();

  if (error) throw error;
  return data as LinkCard;
}

export async function updateLinkCard(id: string, draft: LinkCardDraft): Promise<void> {
  const { error } = await supabase.from(TABLE).update(draft).eq('id', id);
  if (error) throw error;
}

export async function deleteLinkCard(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
