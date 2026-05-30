// apps/web/src/store/clockStore.ts
// GameClock: a lightweight day-phase clock (morning / afternoon / evening) that
// drives NPC schedules. Advanced manually for now (via the ClockHud button);
// a timed day-night cycle can replace advancePhase later without touching NPCs.
import { create } from 'zustand';
import { DAY_PHASES, type DayPhase } from '@campus-quest/game-data';

interface ClockState {
  phase: DayPhase;
  day: number;
  advancePhase: () => void;
  setPhase: (phase: DayPhase) => void;
}

export const useClockStore = create<ClockState>((set) => ({
  phase: 'morning',
  day: 1,
  advancePhase: () =>
    set((s) => {
      const idx = DAY_PHASES.indexOf(s.phase);
      const nextIdx = (idx + 1) % DAY_PHASES.length;
      return { phase: DAY_PHASES[nextIdx], day: nextIdx === 0 ? s.day + 1 : s.day };
    }),
  setPhase: (phase) => set({ phase }),
}));
