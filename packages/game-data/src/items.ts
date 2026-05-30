// packages/game-data/src/items.ts
export type ItemType =
  | 'key'
  | 'keycard'
  | 'consumable'
  | 'material'
  | 'quest'
  | 'collectible'
  | 'gift'
  | 'map_fragment'
  | 'flyer'
  | 'rumor_note'
  | 'document';

export type ItemRarity = 'common' | 'rare' | 'epic';

/** Effects applied when a consumable is used. */
export interface ItemEffect {
  stamina?: number;
}

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  icon: string; // Emoji or asset path
  stackable: boolean;
  maxStack?: number;
  /** Hidden collectibles scattered around the world (vs. given/quest items). */
  hidden?: boolean;
  rarity?: ItemRarity;
  /** For consumables: what using the item does. */
  effect?: ItemEffect;
}

export const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
  // --- Keys / access ---
  library_keycard: {
    id: 'library_keycard',
    name: 'Library Keycard',
    description: 'Access card for the restricted section of Starbridge Library.',
    type: 'keycard',
    icon: '🔑',
    stackable: false,
  },
  club_badge: {
    id: 'club_badge',
    name: 'Club Badge',
    description: 'Official badge of the Campus Investigation Club.',
    type: 'quest',
    icon: '🎖️',
    stackable: false,
  },

  // --- Materials ---
  data_fragment: {
    id: 'data_fragment',
    name: 'Corrupted Data Fragment',
    description: 'A piece of corrupted campus network data. Might be useful later.',
    type: 'material',
    icon: '💾',
    stackable: true,
    maxStack: 10,
  },

  // --- Consumables (usable from the inventory) ---
  energy_drink: {
    id: 'energy_drink',
    name: 'Star Energy Drink',
    description: 'Restores 30 stamina. Tastes like blue raspberry.',
    type: 'consumable',
    icon: '🥤',
    stackable: true,
    maxStack: 5,
    effect: { stamina: 30 },
  },
  rice_ball: {
    id: 'rice_ball',
    name: 'Rice Ball',
    description: 'A homemade snack. Restores 15 stamina.',
    type: 'consumable',
    icon: '🍙',
    stackable: true,
    maxStack: 10,
    effect: { stamina: 15 },
  },
  coffee_can: {
    id: 'coffee_can',
    name: 'Canned Coffee',
    description: 'Bitter but effective. Restores 20 stamina.',
    type: 'consumable',
    icon: '☕',
    stackable: true,
    maxStack: 8,
    effect: { stamina: 20 },
  },

  // --- Friendship gifts (favourite items raise NPC friendship) ---
  flower_bouquet: {
    id: 'flower_bouquet',
    name: 'Flower Bouquet',
    description: 'A cheerful bunch of campus garden flowers. A thoughtful gift.',
    type: 'gift',
    icon: '💐',
    stackable: true,
    maxStack: 5,
  },
  choco_box: {
    id: 'choco_box',
    name: 'Box of Chocolates',
    description: 'Sweet treats from the campus store. Most people love these.',
    type: 'gift',
    icon: '🍫',
    stackable: true,
    maxStack: 5,
  },

  // --- Documents / notes / flyers ---
  library_document: {
    id: 'library_document',
    name: 'Library Document',
    description: 'An old checkout record from the restricted archive.',
    type: 'document',
    icon: '📜',
    stackable: true,
    maxStack: 20,
  },
  rumor_note: {
    id: 'rumor_note',
    name: 'School Rumor Note',
    description: 'A scribbled note hinting at the mystery of the missing semester.',
    type: 'rumor_note',
    icon: '📝',
    stackable: true,
    maxStack: 20,
  },
  club_flyer: {
    id: 'club_flyer',
    name: 'Club Flyer',
    description: 'A flyer advertising an upcoming campus club event.',
    type: 'flyer',
    icon: '📄',
    stackable: true,
    maxStack: 20,
  },
  map_fragment: {
    id: 'map_fragment',
    name: 'Map Fragment',
    description: 'A torn piece of a campus map. Collect them all to reveal a secret.',
    type: 'map_fragment',
    icon: '🗺️',
    stackable: true,
    maxStack: 9,
  },

  // --- Hidden collectibles (scattered around the town) ---
  star_coin: {
    id: 'star_coin',
    name: 'Star Coin',
    description: 'A shiny commemorative campus coin.',
    type: 'collectible',
    icon: '🪙',
    stackable: true,
    maxStack: 99,
    hidden: true,
    rarity: 'common',
  },
  campus_sticker: {
    id: 'campus_sticker',
    name: 'Campus Sticker',
    description: 'A collectible sticker of the school mascot.',
    type: 'collectible',
    icon: '🩹',
    stackable: true,
    maxStack: 99,
    hidden: true,
    rarity: 'common',
  },
  lucky_charm: {
    id: 'lucky_charm',
    name: 'Lucky Charm',
    description: 'A small charm said to bring good fortune on exams.',
    type: 'collectible',
    icon: '🍀',
    stackable: true,
    maxStack: 99,
    hidden: true,
    rarity: 'rare',
  },
  old_photo: {
    id: 'old_photo',
    name: 'Old Photo',
    description: 'A faded photograph from a past school festival.',
    type: 'collectible',
    icon: '🖼️',
    stackable: true,
    maxStack: 99,
    hidden: true,
    rarity: 'rare',
  },
  mascot_pin: {
    id: 'mascot_pin',
    name: 'Mascot Pin',
    description: 'A rare enamel pin of the Starbridge mascot.',
    type: 'collectible',
    icon: '📌',
    stackable: true,
    maxStack: 99,
    hidden: true,
    rarity: 'epic',
  },
};

export function getItemById(id: string): ItemDefinition | undefined {
  return ITEM_DEFINITIONS[id];
}

export function getItemsByType(type: ItemType): ItemDefinition[] {
  return Object.values(ITEM_DEFINITIONS).filter((i) => i.type === type);
}

/** Item ids flagged as hidden collectibles — used by the world collectible spawner. */
export const COLLECTIBLE_ITEM_IDS: string[] = Object.values(ITEM_DEFINITIONS)
  .filter((i) => i.hidden)
  .map((i) => i.id);
