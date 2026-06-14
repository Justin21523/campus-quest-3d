// apps/web/src/store/giftStore.ts
// GiftSystem: tracks gift-giving to NPCs, enforces daily limits per phase,
// computes reactions, and applies friendship changes. Persisted to localStorage.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  computeGiftResult,
  MAX_GIFTS_PER_PHASE,
  getNpcById,
  type GiftReaction,
  type GiftResult,
} from '@campus-quest/game-data';
import { useFriendshipStore } from './friendshipStore';
import { useInventoryStore } from './inventoryStore';
import { useClockStore } from './clockStore';

interface GiftHistoryEntry {
  npcId: string;
  itemId: string;
  reaction: GiftReaction;
  day: number;
  phase: string;
}

interface GiftState {
  /** Gifts given per NPC per day-phase key ("npcId-day-phase"). */
  giftsThisPhase: Record<string, number>;
  /** Last N gift history entries (capped at 50). */
  history: GiftHistoryEntry[];
  /** Most recent gift result for UI display. */
  lastResult: GiftResult | null;
  lastGiftNpcId: string | null;

  /** Check if the player can give a gift to this NPC this phase. */
  canGiveGift: (npcId: string) => boolean;
  /** Give a gift: removes item from inventory, applies friendship, records history. */
  giveGift: (npcId: string, itemId: string) => GiftResult | null;
  /** Clear the last result display. */
  clearLastResult: () => void;
  /** Get total gifts given to an NPC across all time. */
  getTotalGiftsToNpc: (npcId: string) => number;
}

function phaseKey(npcId: string): string {
  const { phase, day } = useClockStore.getState();
  return `${npcId}-${day}-${phase}`;
}

export const useGiftStore = create<GiftState>()(
  persist(
    (set, get) => ({
      giftsThisPhase: {},
      history: [],
      lastResult: null,
      lastGiftNpcId: null,

      canGiveGift: (npcId) => {
        const key = phaseKey(npcId);
        return (get().giftsThisPhase[key] ?? 0) < MAX_GIFTS_PER_PHASE;
      },

      giveGift: (npcId, itemId) => {
        const key = phaseKey(npcId);
        const given = get().giftsThisPhase[key] ?? 0;
        if (given >= MAX_GIFTS_PER_PHASE) return null;

        const npc = getNpcById(npcId);
        if (!npc) return null;

        // Remove item from inventory
        const removeItem = useInventoryStore.getState().removeItem;
        if (!removeItem(itemId, 1)) return null;

        // Compute reaction
        const result = computeGiftResult(npcId, itemId, npc.favoriteItems);

        // Apply friendship change
        useFriendshipStore.getState().addFriendship(npcId, result.friendshipChange);

        // Record
        const { phase, day } = useClockStore.getState();
        const entry: GiftHistoryEntry = { npcId, itemId, reaction: result.reaction, day, phase };

        set((s) => ({
          giftsThisPhase: { ...s.giftsThisPhase, [key]: given + 1 },
          history: [entry, ...s.history].slice(0, 50),
          lastResult: result,
          lastGiftNpcId: npcId,
        }));

        return result;
      },

      clearLastResult: () => set({ lastResult: null, lastGiftNpcId: null }),

      getTotalGiftsToNpc: (npcId) => {
        return get().history.filter((h) => h.npcId === npcId).length;
      },
    }),
    { name: 'cq-gifts' },
  ),
);
