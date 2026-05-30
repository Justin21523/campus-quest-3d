// apps/web/src/store/travelStore.ts
// FastTravelSystem state: which school districts the player has unlocked
// (persisted) plus a transient UI flag for the fast-travel menu. The home
// district is unlocked by default; bus-stop travel to a destination unlocks it
// so it can later be reached instantly from the map.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TravelState {
  unlockedDistricts: string[];
  isFastTravelOpen: boolean;

  unlock: (id: string) => void;
  isUnlocked: (id: string) => boolean;
  openFastTravel: () => void;
  closeFastTravel: () => void;
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set, get) => ({
      unlockedDistricts: ['campus_outdoor'],
      isFastTravelOpen: false,

      unlock: (id) =>
        set((s) =>
          s.unlockedDistricts.includes(id)
            ? s
            : { unlockedDistricts: [...s.unlockedDistricts, id] },
        ),
      isUnlocked: (id) => get().unlockedDistricts.includes(id),
      openFastTravel: () => set({ isFastTravelOpen: true }),
      closeFastTravel: () => set({ isFastTravelOpen: false }),
    }),
    { name: 'cq-travel', partialize: (s) => ({ unlockedDistricts: s.unlockedDistricts }) },
  ),
);
