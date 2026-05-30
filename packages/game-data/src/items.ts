// packages/game-data/src/items.ts
export type ItemType = 'key' | 'consumable' | 'material' | 'quest';

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  icon: string; // Emoji or asset path
  stackable: boolean;
  maxStack?: number;
}

export const ITEM_DEFINITIONS: Record<string, ItemDefinition> = {
  library_keycard: {
    id: 'library_keycard',
    name: 'Library Keycard',
    description: 'Access card for the restricted section of Starbridge Library.',
    type: 'key',
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
  data_fragment: {
    id: 'data_fragment',
    name: 'Corrupted Data Fragment',
    description: 'A piece of corrupted campus network data. Might be useful later.',
    type: 'material',
    icon: '💾',
    stackable: true,
    maxStack: 10,
  },
  energy_drink: {
    id: 'energy_drink',
    name: 'Star Energy Drink',
    description: 'Restores 30 stamina. Tastes like blue raspberry.',
    type: 'consumable',
    icon: '🥤',
    stackable: true,
    maxStack: 5,
  },
};

export function getItemById(id: string): ItemDefinition | undefined {
  return ITEM_DEFINITIONS[id];
}
