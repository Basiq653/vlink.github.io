import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ExternalLink, Database, Link2, LogIn, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useReveal } from '../lib/useReveal';
import { supabase } from '../lib/supabase';
import type { SessionUser } from '../lib/supabase';
import type { AuthMode } from '../types';
import { fetchProfileById, updateOwnProfile, updateOwnAppearance, appearanceFrom, APPEARANCE_FALLBACK, type Profile, type ProfileDraft, type AppearanceDraft } from '../lib/profiles';
import { uploadMedia, type MediaKind } from '../lib/storage';
import {
  CARD_CATEGORIES,
  createLinkCard,
  deleteLinkCard,
  fetchLinkCards,
  updateLinkCard,
  type LinkCard,
  type LinkCardDraft,
} from '../lib/linkCards';

const EMPTY_DRAFT: LinkCardDraft = { title: '', description: '', category: 'Social', icon: '🔗', url: '' };

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text)' } as const;
const inputStyle = { padding: '10px 14px', fontSize: '0.9rem' } as const;

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function DashboardPage({
  user,
  onAuthOpen,
}: {
  user: SessionUser | null;
  onAuthOpen: (mode: AuthMode) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useReveal(containerRef, { selector: '.dash-animate', y: 24, stagger: 0.08 });

  const [cards, setCards] = useState<LinkCard[]>([]);
  const [missingTable, setMissingTable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<LinkCardDraft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>({ username: '', display_name: '' });
  const [profileMessage, setProfileMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [userId, setUserId] = useState('');
  const [appearance, setAppearance] = useState<AppearanceDraft>({ ...APPEARANCE_FALLBACK });
  const [uploadingKind, setUploadingKind] = useState<MediaKind | null>(null);
  const [appearanceMessage, setAppearanceMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingAppearance, setSavingAppearance] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCards([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    const myId = data.user?.id ?? '';
    setUserId(myId);
    const { cards: fetched, missingTable: missing } = await fetchLinkCards();
    setCards(fetched.filter((card) => card.user_id === myId));
    setMissingTable(missing);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // загрузка профиля
  useEffect(() => {
    if (!user) return;
    let canceled = false;
    supabase.auth.getUser().then(async ({ data }) => {
      if (canceled || !data.user) return;
      const p = await fetchProfileById(data.user.id);
      if (canceled) return;
      setProfile(p);
      setProfileDraft({
        username: p?.username ?? (data.user?.email?.split('@')[0] ?? ''),
        display_name: p?.display_name || user.name,
      });
      setAppearance(appearanceFrom(p));
    });
    return () => { canceled = true; };
  }, [user]);

  const handleProfileSave = async (event: FormEvent) => {
    event.preventDefault();
    setProfileMessage(null);
    setSavingProfile(true);
    const result = await updateOwnProfile(profileDraft);
    setSavingProfile(false);
    if (result.ok) {
      const username = profileDraft.username.trim().toLowerCase();
      setProfileMessage({ ok: true, text: `Профиль сохранён! Ваша страница: #/u/${username}` });
      if (userId) {
        const p = await fetchProfileById(userId);
        setProfile(p);
      }
    } else {
      setProfileMessage({ ok: false, text: result.message || 'Не удалось сохранить.' });
    }
  };

  const handleMediaUpload = async (kind: MediaKind, file: File) => {
    setAppearanceMessage(null);
    setUploadingKind(kind);
    try {
      const url = await uploadMedia(file, kind);
      const field =
        kind === 'background' ? 'background_url'
        : kind === 'audio' ? 'audio_url'
        : kind === 'avatar' ? 'avatar_url'
        : 'cursor_url';
      setAppearance((d) => ({ ...d, [field]: url }));
      setAppearanceMessage({ ok: true, text: 'Файл загружен. Нажмите «Сохранить внешний вид».' });
    } catch (err) {
      setAppearanceMessage({ ok: false, text: err instanceof Error ? err.message : String(err) });
    } finally {
      setUploadingKind(null);
    }
  };

  const handleAppearanceSave = async (event: FormEvent) => {
    event.preventDefault();
    setAppearanceMessage(null);
    setSavingAppearance(true);
    const result = await updateOwnAppearance(appearance);
    setSavingAppearance(false);
    setAppearanceMessage(
      result.ok
        ? { ok: true, text: 'Внешний вид сохранён! Обновите публичную страницу, чтобы увидеть изменения.' }
        : { ok: false, text: result.message || 'Не удалось сохранить.' },
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const url = normalizeUrl(draft.url);
    if (!url) {
      setError('Укажите ссылку.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateLinkCard(editingId, { ...draft, url });
        setCards((prev) => prev.map((card) => (card.id === editingId ? { ...card, ...draft, url } : card)));
      } else {
        const created = await createLinkCard({ ...draft, url });
        setCards((prev) => [...prev, created]);
      }
      setDraft(EMPTY_DRAFT);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (card: LinkCard) => {
    setEditingId(card.id);
    setDraft({ title: card.title, description: card.description, category: card.category, icon: card.icon, url: card.url });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setError('');
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await deleteLinkCard(id);
      setCards((prev) => prev.filter((card) => card.id !== id));
      if (editingId === id) cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // --- Not logged in ---
  if (!user) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '120px 24px 60px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div className="section-tag">Мои ссылки</div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: 16 }}>
          Сначала войдите в аккаунт
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: 420, marginBottom: 40, lineHeight: 1.6 }}>
          После входа вы сможете собирать свои карточки: соцсети, проекты и контакты — и получите персональную страницу Vlink.
        </p>
        <button type="button" className="btn-primary" onClick={() => onAuthOpen('login')} style={{ padding: '13px 28px', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <LogIn size={18} />
          Войти
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ minHeight: '100vh', padding: '100px 24px 100px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 48, paddingTop: 40 }}>
          <div className="dash-animate">
            <div className="section-tag">
              <Link2 size={14} />
              Личный кабинет
            </div>
          </div>
          <h1
            className="dash-animate"
            style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 12 }}
          >
            Мои ссылки
          </h1>
          <p className="dash-animate" style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 560 }}>
            {editingId ? 'Редактируйте карточку и сохраните изменения.' : 'Добавьте карточки — они появятся на вашей публичной странице и в каталоге «Ссылки».'}
          </p>
        </div>

        {missingTable && (
          <div
            className="dash-animate"
            role="status"
            style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'rgba(255, 191, 72, 0.08)', border: '1px solid rgba(255, 191, 72, 0.25)', borderRadius: 14, padding: '16px 20px', marginBottom: 32 }}
          >
            <Database size={18} color="#ffbf48" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6 }}>
              <b style={{ color: '#ffbf48' }}>Таблицы profiles / link_cards ещё не созданы.</b>
              <br />
              Откройте Supabase → SQL Editor → New query, вставьте содержимое файла{' '}
              <code style={{ color: 'var(--blue)', background: 'rgba(79,158,255,0.08)', padding: '1px 6px', borderRadius: 6 }}>supabase/migration.sql</code>{' '}
              из этого репозитория и нажмите Run. Затем просто обновите страницу.
            </div>
          </div>
        )}

        {/* Настройки профиля */}
        <form
          className="dash-animate glass-card"
          onSubmit={handleProfileSave}
          style={{ padding: 24, maxWidth: 640, marginBottom: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 700 }}>Профиль</h2>
            {profile && (
              <a
                href={`#/u/${profile.username}`}
                className="btn-ghost"
                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                <ExternalLink size={14} />
                Моя страница
              </a>
            )}
          </div>

          {profileMessage && (
            <div
              role={profileMessage.ok ? 'status' : 'alert'}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: profileMessage.ok ? 'rgba(29, 233, 182, 0.08)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${profileMessage.ok ? 'rgba(29, 233, 182, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                color: profileMessage.ok ? 'var(--teal)' : 'var(--red)',
                fontSize: '0.85rem',
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              {profileMessage.text}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="profile-name" style={labelStyle}>Отображаемое имя</label>
            <input
              id="profile-name"
              className="field-input"
              type="text"
              value={profileDraft.display_name}
              onChange={(e) => setProfileDraft((d) => ({ ...d, display_name: e.target.value }))}
              placeholder="Как вас называть на странице"
              maxLength={48}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label htmlFor="profile-username" style={labelStyle}>Адрес страницы (username)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--muted)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>/u/</span>
              <input
                id="profile-username"
                className="field-input"
                type="text"
                value={profileDraft.username}
                onChange={(e) => setProfileDraft((d) => ({ ...d, username: e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '') }))}
                placeholder="ivan"
                required
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            <p style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--muted)' }}>
              Латиница, цифры, дефис и подчёркивание. Страница: <span style={{ color: 'var(--blue)' }}>#/u/{profileDraft.username || 'ivan'}</span>
            </p>
          </div>

          <button type="submit" className="btn-primary" disabled={savingProfile} style={{ padding: '11px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {savingProfile ? (
              <span aria-hidden="true" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <Save size={16} />
            )}
            {savingProfile ? 'Сохраняем…' : 'Сохранить профиль'}
          </button>
        </form>

        {/* Внешний вид (guns.lol style) */}
        <form
          className="dash-animate glass-card"
          onSubmit={handleAppearanceSave}
          style={{ padding: 24, marginBottom: 40 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 700 }}>Внешний вид страницы</h2>
            {profile && (
              <a
                href={`#/u/${profile.username}`}
                className="btn-ghost"
                target="_blank"
                rel="noreferrer"
                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
              >
                <ExternalLink size={14} />
                Предпросмотр
              </a>
            )}
          </div>

          {appearanceMessage && (
            <div
              role={appearanceMessage.ok ? 'status' : 'alert'}
              style={{
                padding: '12px 16px',
                borderRadius: 10,
                background: appearanceMessage.ok ? 'rgba(29, 233, 182, 0.08)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${appearanceMessage.ok ? 'rgba(29, 233, 182, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                color: appearanceMessage.ok ? 'var(--teal)' : 'var(--red)',
                fontSize: '0.85rem',
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              {appearanceMessage.text}
            </div>
          )}

          {/* медиа-плитки */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
            {([
              { kind: 'background', label: 'Фон', hint: 'Изображение', accept: 'image/*', urlKey: 'background_url', preview: true },
              { kind: 'audio', label: 'Аудио', hint: 'MP3 / OGG', accept: 'audio/*', urlKey: 'audio_url', preview: false },
              { kind: 'avatar', label: 'Аватар профиля', hint: 'Изображение', accept: 'image/*', urlKey: 'avatar_url', preview: true },
              { kind: 'cursor', label: 'Курсор', hint: 'PNG / CUR', accept: 'image/*,.cur', urlKey: 'cursor_url', preview: false },
            ] as const).map((tile) => (
              <div key={tile.kind} style={{ border: '1px solid var(--border-hover)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tile.label}</span>
                {appearance[tile.urlKey] && tile.preview ? (
                  <img src={appearance[tile.urlKey]} alt="" style={{ width: '100%', height: 72, objectFit: 'cover', borderRadius: 10 }} />
                ) : (
                  <label
                    style={{
                      minHeight: 72,
                      borderRadius: 10,
                      background: 'rgba(79, 158, 255, 0.05)',
                      border: '1px dashed rgba(79, 158, 255, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      fontSize: '0.78rem',
                      color: 'var(--muted)',
                      cursor: 'pointer',
                      padding: 8,
                    }}
                  >
                    {uploadingKind === tile.kind ? 'Загрузка…' : appearance[tile.urlKey] ? 'Заменить файл' : `Нажмите, чтобы загрузить (${tile.hint})`}
                    <input
                      type="file"
                      accept={tile.accept}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMediaUpload(tile.kind, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
                {appearance[tile.urlKey] && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="file"
                      accept={tile.accept}
                      id={`replace-${tile.kind}`}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMediaUpload(tile.kind, file);
                        e.target.value = '';
                      }}
                    />
                    <label htmlFor={`replace-${tile.kind}`} className="btn-ghost" style={{ padding: '5px 10px', fontSize: '0.72rem', cursor: 'pointer' }}>
                      Заменить
                    </label>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setAppearance((d) => ({ ...d, [tile.urlKey]: '' }))}
                      style={{ padding: '5px 10px', fontSize: '0.72rem', color: 'var(--red)' }}
                    >
                      Убрать
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* общие настройки */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div>
              <label htmlFor="ap-desc" style={labelStyle}>Описание</label>
              <input
                id="ap-desc"
                className="field-input"
                type="text"
                value={appearance.description}
                onChange={(e) => setAppearance((d) => ({ ...d, description: e.target.value }))}
                placeholder="это мое описание"
                maxLength={160}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="ap-effect" style={labelStyle}>Эффекты фона</label>
              <select
                id="ap-effect"
                className="field-input"
                value={appearance.bg_effect}
                onChange={(e) => setAppearance((d) => ({ ...d, bg_effect: e.target.value }))}
                style={inputStyle}
              >
                <option value="none">Без эффекта</option>
                <option value="rain">Дождь</option>
                <option value="snow">Снег</option>
                <option value="stars">Звёзды</option>
              </select>
            </div>
            <div>
              <label htmlFor="ap-location" style={labelStyle}>Местоположение</label>
              <input
                id="ap-location"
                className="field-input"
                type="text"
                value={appearance.location}
                onChange={(e) => setAppearance((d) => ({ ...d, location: e.target.value }))}
                placeholder="Canada"
                maxLength={48}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="ap-opacity" style={labelStyle}>Прозрачность профиля — {appearance.bg_opacity}%</label>
              <input
                id="ap-opacity"
                type="range"
                min={10}
                max={100}
                step={5}
                value={appearance.bg_opacity}
                onChange={(e) => setAppearance((d) => ({ ...d, bg_opacity: Number(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label htmlFor="ap-blur" style={labelStyle}>Размытие фона — {appearance.bg_blur}px</label>
              <input
                id="ap-blur"
                type="range"
                min={0}
                max={80}
                step={4}
                value={appearance.bg_blur}
                onChange={(e) => setAppearance((d) => ({ ...d, bg_blur: Number(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* цвета */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 8 }}>
            {([
              { key: 'accent_color', label: 'Акцентный цвет' },
              { key: 'text_color', label: 'Цвет текста' },
              { key: 'bg_color', label: 'Цвет фона' },
              { key: 'icons_color', label: 'Цвет иконок' },
            ] as const).map((row) => (
              <div key={row.key} style={{ border: '1px solid var(--border-hover)', borderRadius: 12, padding: '10px 12px' }}>
                <label htmlFor={`color-${row.key}`} style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>{row.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    id={`color-${row.key}`}
                    type="color"
                    value={appearance[row.key]}
                    onChange={(e) => setAppearance((d) => ({ ...d, [row.key]: e.target.value }))}
                    aria-label={row.label}
                    style={{ width: 34, height: 30, padding: 0, border: 'none', background: 'none', borderRadius: 8, cursor: 'pointer' }}
                  />
                  <code style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{appearance[row.key]}</code>
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn-primary" disabled={savingAppearance} style={{ padding: '11px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {savingAppearance ? (
              <span aria-hidden="true" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <Save size={16} />
            )}
            {savingAppearance ? 'Сохраняем…' : 'Сохранить внешний вид'}
          </button>
        </form>

        {/* форма создания / редактирования карточки */}
        <form
          className="dash-animate glass-card"
          onSubmit={handleSubmit}
          style={{ padding: 24, maxWidth: 640, marginBottom: 40 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '1.1rem', fontWeight: 700 }}>
              {editingId ? 'Редактировать карточку' : 'Новая карточка'}
            </h2>
            {editingId && (
              <button type="button" className="btn-ghost" onClick={cancelEdit} style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <X size={14} />
                Отменить
              </button>
            )}
          </div>

          {error && (
            <div role="alert" style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: 'var(--red)', fontSize: '0.85rem', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label htmlFor="card-icon" style={labelStyle}>Иконка</label>
              <input
                id="card-icon"
                className="field-input"
                type="text"
                value={draft.icon}
                onChange={(e) => setDraft((d) => ({ ...d, icon: e.target.value.slice(0, 2) }))}
                maxLength={2}
                aria-label="Эмодзи иконка"
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="card-title" style={labelStyle}>Название</label>
              <input
                id="card-title"
                className="field-input"
                type="text"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder="Мой канал"
                required
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: '2' }}>
              <label htmlFor="card-url" style={labelStyle}>Ссылка</label>
              <input
                id="card-url"
                className="field-input"
                type="text"
                value={draft.url}
                onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
                placeholder="youtube.com/@mychannel"
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="card-desc" style={labelStyle}>Описание</label>
            <input
              id="card-desc"
              className="field-input"
              type="text"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Что можно найти по этой ссылке"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label htmlFor="card-category" style={labelStyle}>Категория</label>
            <select
              id="card-category"
              className="field-input"
              value={draft.category}
              onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              style={inputStyle}
            >
              {CARD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} style={{ background: 'var(--card)' }}>
                  {cat === 'Other' ? 'Другое' : cat}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%', padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {saving ? (
              <span aria-hidden="true" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : editingId ? (
              <Save size={16} />
            ) : (
              <Plus size={16} />
            )}
            {saving ? 'Сохраняем…' : editingId ? 'Сохранить изменения' : 'Создать карточку'}
          </button>
        </form>

        {/* список карточек */}
        {loading ? (
          <p style={{ color: 'var(--muted)' }}>Загружаем карточки…</p>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--muted)' }}>
            <p style={{ fontSize: '1.05rem', marginBottom: 8 }}>Пока нет ни одной карточки</p>
            <p style={{ fontSize: '0.9rem' }}>Создайте первую с помощью формы выше</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {cards.map((card) => (
              <div key={card.id} className="dash-animate glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div
                    aria-hidden="true"
                    style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(79, 158, 255, 0.1)', border: '1px solid rgba(79, 158, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}
                  >
                    {card.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '0.95rem' }}>{card.title}</h3>
                      <span style={{ fontSize: '0.7rem', color: 'var(--blue)', background: 'rgba(79, 158, 255, 0.1)', padding: '2px 8px', borderRadius: 100, flexShrink: 0 }}>
                        {card.category === 'Other' ? 'Другое' : card.category}
                      </span>
                    </div>
                    {card.description && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.5 }}>{card.description}</p>
                    )}
                    <a href={card.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--blue)', wordBreak: 'break-all' }}>
                      {card.url.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button type="button" className="btn-ghost" onClick={() => startEdit(card)} style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Pencil size={14} />
                    Изменить
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => handleDelete(card.id)} aria-label={`Удалить ${card.title}`} style={{ padding: '8px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', color: 'var(--red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
