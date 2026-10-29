import { useEffect, useState } from 'react';
import { supabase, type SessionUser } from './supabase';

function toUser(sessionUser: { email?: string | null; user_metadata?: { name?: string; full_name?: string } } | null): SessionUser | null {
  if (!sessionUser) return null;
  const name =
    sessionUser.user_metadata?.name ||
    sessionUser.user_metadata?.full_name ||
    sessionUser.email?.split('@')[0] ||
    'Пользователь';
  return { name, email: sessionUser.email || '' };
}

/** Subscribes to the Supabase auth session for the whole app. */
export function useSupabaseUser() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session?.user ?? null));
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session?.user ?? null));
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, ready };
}

export async function signOut() {
  await supabase.auth.signOut();
}
