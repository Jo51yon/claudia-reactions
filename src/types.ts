export interface ClaudiaReaction {
  id: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  reaction_type: string;
  /** Added 2026-08-24. Only meaningful when reaction_type is 'star' -- a 1-5 numeric rating,
      matching a real, additive column found while checking SafeSpaces' blog_ratings table.
      Null for every other (discrete/emoji) reaction_type. See @jo51yon/claudia-ratings for
      the real star-picker UI that uses this. */
  rating_value: number | null;
  created_at: string;
}
export interface ClaudiaReactionKind {
  type: string;
  emoji: string;
}
