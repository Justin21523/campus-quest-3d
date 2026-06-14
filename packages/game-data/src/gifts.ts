// packages/game-data/src/gifts.ts
// Gift system: defines how NPCs react to gifts (favorite, neutral, disliked)
// and the friendship points awarded for each reaction type.

export type GiftReaction = 'loved' | 'liked' | 'neutral' | 'disliked';

export interface GiftResult {
  reaction: GiftReaction;
  friendshipChange: number;
  reactionText: string;
}

/** Friendship points awarded per reaction type. */
export const GIFT_FRIENDSHIP_POINTS: Record<GiftReaction, number> = {
  loved: 15,
  liked: 8,
  neutral: 3,
  disliked: -5,
};

/** Maximum gifts per NPC per day-phase. */
export const MAX_GIFTS_PER_PHASE = 2;

/** Items that NPCs actively dislike. */
export const DISLIKED_ITEMS: Record<string, string[]> = {
  alice: ['energy_drink', 'sports_drink'],
  bob: ['library_document', 'data_fragment'],
  mei: ['coffee_can', 'data_fragment'],
  sato: ['choco_box', 'flower_bouquet'],
  hana: ['coffee_can', 'rumor_note'],
  kenji: ['choco_box', 'flower_bouquet'],
};

/** Reaction text templates per reaction type. */
export const REACTION_TEXTS: Record<GiftReaction, string[]> = {
  loved: [
    'Oh wow, this is exactly what I wanted! Thank you so much!',
    'You remembered my favorite! This means a lot to me.',
    'I absolutely love this! You really know me well.',
  ],
  liked: [
    'This is nice, thank you!',
    'Oh, how thoughtful of you!',
    'I appreciate the gift, thanks!',
  ],
  neutral: [
    'Oh, thanks... I guess.',
    'Hmm, this is... interesting.',
    'Thanks for thinking of me.',
  ],
  disliked: [
    'Uh... this isn\'t really my thing.',
    'I\'m not sure what to do with this...',
    'Thanks, but I don\'t really like this kind of stuff.',
  ],
};

/** Pick a random reaction text for the given reaction type. */
export function getReactionText(reaction: GiftReaction): string {
  const texts = REACTION_TEXTS[reaction];
  return texts[Math.floor(Math.random() * texts.length)];
}

/**
 * Determine the reaction type for a gift given to an NPC.
 * - If the item is in the NPC's favoriteItems → loved
 * - If the item is in DISLIKED_ITEMS for the NPC → disliked
 * - Otherwise → liked (if it's a gift-type item) or neutral
 */
export function determineGiftReaction(
  npcId: string,
  itemId: string,
  favoriteItems: string[],
): GiftReaction {
  if (favoriteItems.includes(itemId)) return 'loved';
  if (DISLIKED_ITEMS[npcId]?.includes(itemId)) return 'disliked';
  // Items with type 'gift' or 'food' are generally liked; others are neutral
  return 'liked';
}

/** Build a complete GiftResult for a gift interaction. */
export function computeGiftResult(
  npcId: string,
  itemId: string,
  favoriteItems: string[],
): GiftResult {
  const reaction = determineGiftReaction(npcId, itemId, favoriteItems);
  return {
    reaction,
    friendshipChange: GIFT_FRIENDSHIP_POINTS[reaction],
    reactionText: getReactionText(reaction),
  };
}
