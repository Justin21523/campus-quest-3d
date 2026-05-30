// packages/game-data/src/npcs.ts
// NPC registry: data-driven NPC definitions with a simple day-phase schedule
// (morning / afternoon / evening) that moves them between zones, dialogue lines,
// the quests they offer, and their favourite gift items (used by the friendship
// system in a later step).

export type DayPhase = 'morning' | 'afternoon' | 'evening';

export const DAY_PHASES: DayPhase[] = ['morning', 'afternoon', 'evening'];

/** Structurally compatible with the web app's DialogueLine. */
export interface NpcDialogueLine {
  speaker: string;
  text: string;
  questId?: string;
}

export interface NpcScheduleEntry {
  zone: string;
  position: [number, number, number];
}

export interface NpcDefinition {
  id: string;
  name: string;
  role: string;
  personality: string;
  homeZone: string;
  schedule: Record<DayPhase, NpcScheduleEntry>;
  dialogue: NpcDialogueLine[];
  availableQuests: string[];
  favoriteItems: string[];
}

export const NPC_DEFINITIONS: Record<string, NpcDefinition> = {
  alice: {
    id: 'alice',
    name: 'Librarian Alice',
    role: 'Librarian',
    personality: 'Calm, observant, a little anxious about the missing books.',
    homeZone: 'library_building',
    schedule: {
      morning: { zone: 'main_building_1f', position: [-3, 0, -2] },
      afternoon: { zone: 'library_building', position: [-2, 0, 6] },
      evening: { zone: 'library_building', position: [2, 0, 8] },
    },
    dialogue: [
      { speaker: 'Alice', text: 'Welcome to the Starbridge Library! Have you noticed anything... strange lately?' },
      { speaker: 'Alice', text: 'Some books have been disappearing from the restricted section. The system shows they were never checked out.' },
      { speaker: 'Alice', text: 'If you\'re looking for clues about the missing semester, start by restoring the catalog marker nearby.', questId: 'q_library_sort' },
    ],
    availableQuests: ['q_library_sort'],
    favoriteItems: ['library_document', 'flower_bouquet'],
  },

  bob: {
    id: 'bob',
    name: 'Club President Bob',
    role: 'Club President',
    personality: 'Energetic, friendly, always recruiting.',
    homeZone: 'club_building',
    schedule: {
      morning: { zone: 'main_building_1f', position: [4, 0, 1] },
      afternoon: { zone: 'club_building', position: [0, 0, 6] },
      evening: { zone: 'campus_outdoor', position: [6, 0, 10] },
    },
    dialogue: [
      { speaker: 'Bob', text: 'Hey! You must be the new transfer student. Perfect timing!' },
      { speaker: 'Bob', text: 'Our club room\'s electronic lock has been glitching since last week. I think someone tampered with the access logs.' },
      { speaker: 'Bob', text: 'Can you help me investigate? There might be a mini-game puzzle to bypass the corrupted security system.' },
    ],
    availableQuests: [],
    favoriteItems: ['club_flyer', 'choco_box'],
  },

  mei: {
    id: 'mei',
    name: 'Mei',
    role: 'Transfer Student',
    personality: 'Cheerful and curious, new to campus just like you.',
    homeZone: 'campus_outdoor',
    schedule: {
      morning: { zone: 'campus_outdoor', position: [-8, 0, 12] },
      afternoon: { zone: 'campus_outdoor', position: [10, 0, 14] },
      evening: { zone: 'campus_outdoor', position: [-6, 0, 16] },
    },
    dialogue: [
      { speaker: 'Mei', text: 'Oh, hi! Are you new here too? This campus is huge — I keep getting lost.' },
      { speaker: 'Mei', text: 'If you find any map fragments around town, they say collecting them reveals a secret spot!' },
    ],
    availableQuests: [],
    favoriteItems: ['choco_box', 'star_coin'],
  },

  sato: {
    id: 'sato',
    name: 'Mr. Sato',
    role: 'Science Teacher',
    personality: 'Strict but fair, proud of the science labs.',
    homeZone: 'academic_building',
    schedule: {
      morning: { zone: 'academic_building', position: [0, 0, 6] },
      afternoon: { zone: 'academic_building', position: [2, 0, 9] },
      evening: { zone: 'main_building_1f', position: [2, 0, 2] },
    },
    dialogue: [
      { speaker: 'Mr. Sato', text: 'The Science Hall is open for self-study. Mind the equipment.' },
      { speaker: 'Mr. Sato', text: 'If you ever bring me a corrupted data fragment, I might be able to analyze it.' },
    ],
    availableQuests: [],
    favoriteItems: ['data_fragment', 'coffee_can'],
  },
};

export function getNpcById(id: string): NpcDefinition | undefined {
  return NPC_DEFINITIONS[id];
}

/** NPCs whose schedule places them in `zone` during `phase`. */
export function getNpcsAt(zone: string, phase: DayPhase): NpcDefinition[] {
  return Object.values(NPC_DEFINITIONS).filter((n) => n.schedule[phase].zone === zone);
}
