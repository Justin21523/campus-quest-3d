// apps/web/src/components/ClockHud.tsx
// Small top-center widget showing the current day-phase and a button to advance
// it (which moves NPCs to their next scheduled location).
import { useClockStore } from '../store/clockStore';
import type { DayPhase } from '@campus-quest/game-data';

const PHASE_LABEL: Record<DayPhase, string> = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌆 Evening',
};

export default function ClockHud() {
  const phase = useClockStore((s) => s.phase);
  const day = useClockStore((s) => s.day);
  const advancePhase = useClockStore((s) => s.advancePhase);

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto">
      <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white flex items-center gap-3 text-sm">
        <span className="font-semibold">Day {day}</span>
        <span>{PHASE_LABEL[phase]}</span>
        <button
          onClick={advancePhase}
          className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 rounded text-xs"
          title="Advance time"
        >
          Advance ▶
        </button>
      </div>
    </div>
  );
}
