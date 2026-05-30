// apps/web/src/store/collectibleStore.ts
// HiddenCollectibleSystem: remembers which world collectibles have been picked
// up (by their deterministic spawn id) so they don't respawn. Persisted to
// localStorage so collected items stay collected across refreshes.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CollectibleState {
  collectedIds: string[];
  collect: (id: string) => void;
  isCollected: (id: string) => boolean;
}

export const useCollectibleStore = create<CollectibleState>()(
  persist(
    (set, get) => ({
      collectedIds: [],
      collect: (id) => {
        if (get().collectedIds.includes(id)) return;
        set((s) => ({ collectedIds: [...s.collectedIds, id] }));
      },
      isCollected: (id) => get().collectedIds.includes(id),
    }),
    { name: 'cq-collectibles' },
  ),
);
