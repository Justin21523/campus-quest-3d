// apps/web/src/store/explorationStore.ts
// Tracks which town chunks the player has discovered, persisted to localStorage
// so the revealed map survives a page refresh. Marking a chunk also reveals its
// immediate 3x3 neighbourhood so the area around the player's path is visible.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chunkKey } from '../world/chunks';

interface ExplorationState {
  discoveredChunks: string[];
  /** Reveal the chunk at (cx,cz) and its 8 neighbours. */
  markDiscovered: (cx: number, cz: number) => void;
  isDiscovered: (cx: number, cz: number) => boolean;
}

export const useExplorationStore = create<ExplorationState>()(
  persist(
    (set, get) => ({
      discoveredChunks: [],
      markDiscovered: (cx, cz) => {
        set((s) => {
          const next = new Set(s.discoveredChunks);
          let changed = false;
          for (let dz = -1; dz <= 1; dz++) {
            for (let dx = -1; dx <= 1; dx++) {
              const key = chunkKey(cx + dx, cz + dz);
              if (!next.has(key)) {
                next.add(key);
                changed = true;
              }
            }
          }
          return changed ? { discoveredChunks: [...next] } : s;
        });
      },
      isDiscovered: (cx, cz) => get().discoveredChunks.includes(chunkKey(cx, cz)),
    }),
    { name: 'cq-exploration' },
  ),
);
