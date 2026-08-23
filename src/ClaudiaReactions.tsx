import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClaudiaReaction, ClaudiaReactionKind } from './types';

/**
 * ClaudiaReactions — emoji reactions with grouped counts and a picker for adding a new one.
 * Ported from SafeSpaces' real content_reactions table and its actual ContentReactions.tsx
 * (checked both before this, not guessed): toggle-on-click (react again to remove), grouped
 * counts, an "add a reaction" popover-style picker.
 *
 * entity_type/entity_id, matching the same polymorphic convention already established in
 * @jo51yon/claudia-comments -- one consistent real naming across both packages, not each
 * inventing its own.
 *
 * The real SafeSpaces emoji set (heart/thumbs_up/clap/laugh/wow/sad/fire) ships as the
 * default -- real, proven choices, not invented -- but is fully overridable via `kinds`, since
 * nothing about the schema or logic actually depends on that specific set.
 */
const DEFAULT_KINDS: ClaudiaReactionKind[] = [
  { type: 'heart', emoji: '\u2764\ufe0f' },
  { type: 'thumbs_up', emoji: '\ud83d\udc4d' },
  { type: 'clap', emoji: '\ud83d\udc4f' },
  { type: 'laugh', emoji: '\ud83d\ude02' },
  { type: 'wow', emoji: '\ud83d\ude2e' },
  { type: 'sad', emoji: '\ud83d\ude22' },
  { type: 'fire', emoji: '\ud83d\udd25' },
];

export interface ClaudiaReactionsProps {
  supabase: SupabaseClient;
  projectSlug: string;
  entityType: string;
  entityId: string;
  currentUserId?: string;
  kinds?: ClaudiaReactionKind[];
  addLabel?: string;
}

export default function ClaudiaReactions({ supabase, projectSlug, entityType, entityId, currentUserId, kinds = DEFAULT_KINDS, addLabel = 'Add a reaction' }: ClaudiaReactionsProps) {
  const [reactions, setReactions] = useState<ClaudiaReaction[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  function fetchAll() {
    supabase.from('claudia_reactions').select('*')
      .eq('project_slug', projectSlug).eq('entity_type', entityType).eq('entity_id', entityId)
      .then(({ data }: { data: ClaudiaReaction[] | null }) => setReactions(data ?? []));
  }
  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel(`claudia-reactions-${entityType}-${entityId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claudia_reactions', filter: `entity_id=eq.${entityId}` }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, projectSlug, entityType, entityId]);

  async function toggle(reactionType: string) {
    if (!currentUserId) return;
    const existing = reactions.find((r) => r.user_id === currentUserId && r.reaction_type === reactionType);
    if (existing) {
      await supabase.from('claudia_reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('claudia_reactions').insert({ project_slug: projectSlug, entity_type: entityType, entity_id: entityId, user_id: currentUserId, reaction_type: reactionType });
    }
    setPickerOpen(false);
    fetchAll();
  }

  const grouped = kinds
    .map((k) => ({
      ...k,
      count: reactions.filter((r) => r.reaction_type === k.type).length,
      userReacted: currentUserId ? reactions.some((r) => r.reaction_type === k.type && r.user_id === currentUserId) : false,
    }))
    .filter((k) => k.count > 0);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {grouped.map((k) => (
        <button key={k.type} type="button" disabled={!currentUserId} onClick={() => toggle(k.type)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999,
                  border: k.userReacted ? '1px solid var(--claudia-kernel-brand, #333)' : '1px solid var(--claudia-kernel-line, #e0e0e0)',
                  background: k.userReacted ? 'var(--claudia-kernel-surface, #f0f0f0)' : 'transparent',
                  cursor: currentUserId ? 'pointer' : 'default', fontSize: '.8rem',
                }}>
          <span>{k.emoji}</span>
          <span className="dim">{k.count}</span>
        </button>
      ))}

      {currentUserId && (
        <div style={{ position: 'relative' }}>
          <button type="button" title={addLabel} onClick={() => setPickerOpen((v) => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.6 }}>
            {'\ud83d\ude0a+'}
          </button>
          {pickerOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 10, display: 'flex', gap: 4, padding: 6,
              background: 'var(--claudia-kernel-card, #fff)', border: '1px solid var(--claudia-kernel-line, #e0e0e0)', borderRadius: 'var(--claudia-kernel-radius, 8px)',
            }}>
              {kinds.map((k) => (
                <button key={k.type} type="button" onClick={() => toggle(k.type)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', padding: 4, borderRadius: 4 }}>
                  {k.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
