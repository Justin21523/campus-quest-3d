// apps/web/src/store/friendshipStore.ts
// FriendshipSystem + RelationshipLevelSystem: tracks friendship points per NPC
// and maps them to relationship tiers. Persisted to localStorage so bonds
// survive a refresh. Talking once per day-phase gives a small bump; completing
// an NPC's quest gives a larger one (see questStore).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DayPhase } from '@campus-quest/game-data';

export type RelationshipLevel =
  | 'Rival'
  | 'Stranger'
  | 'Acquaintance'
  | 'Classmate'
  | 'Friend'
  | 'Close Friend'
  | 'Best Friend';

/** Point thresholds (ascending). Negative points read as Rival. */
const TIERS: { level: RelationshipLevel; min: number }[] = [
  { level: 'Best Friend', min: 150 },
  { level: 'Close Friend', min: 90 },
  { level: 'Friend', min: 50 },
  { level: 'Classmate', min: 25 },
  { level: 'Acquaintance', min: 10 },
  { level: 'Stranger', min: 0 },
  { level: 'Rival', min: -Infinity },
];

/** Pure: relationship tier for a given friendship point total. */
export function friendshipLevel(points: number): RelationshipLevel {
  return TIERS.find((t) => points >= t.min)!.level;
}

interface FriendshipState {
  points: Record<string, number>;
  /** Day-phase in which we last greeted each NPC (limits the per-talk bump). */
  greetedPhase: Record<string, DayPhase>;

  addFriendship: (npcId: string, amount: number) => void;
  /** Greet on talk: +2 once per NPC per day-phase. Returns true if it counted. */
  greet: (npcId: string, phase: DayPhase) => boolean;
  getPoints: (npcId: string) => number;
  getLevel: (npcId: string) => RelationshipLevel;
}

export const useFriendshipStore = create<FriendshipState>()(
  persist(
    (set, get) => ({
      points: {},
      greetedPhase: {},

      addFriendship: (npcId, amount) =>
        set((s) => ({ points: { ...s.points, [npcId]: (s.points[npcId] ?? 0) + amount } })),

      greet: (npcId, phase) => {
        if (get().greetedPhase[npcId] === phase) return false;
        set((s) => ({
          greetedPhase: { ...s.greetedPhase, [npcId]: phase },
          points: { ...s.points, [npcId]: (s.points[npcId] ?? 0) + 2 },
        }));
        return true;
      },

      getPoints: (npcId) => get().points[npcId] ?? 0,
      getLevel: (npcId) => friendshipLevel(get().points[npcId] ?? 0),
    }),
    { name: 'cq-friendship' },
  ),
);
