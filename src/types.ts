export interface ClaudiaReaction {
  id: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
}
export interface ClaudiaReactionKind {
  type: string;
  emoji: string;
}
