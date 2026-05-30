// apps/web/src/components/FastTravelMenu.tsx
// Overlay shown when a bus stop is used (E). Lists the school districts you can
// travel to (buses reach everywhere); selecting one fades to that district and
// unlocks it for instant map fast travel. Visited districts are tagged.
import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useTravelStore } from '../store/travelStore';
import { FAST_TRAVEL_DESTINATIONS, getDistrict } from '../data/maps/schools';
import { useFastTravel } from '../hooks/useFastTravel';

export default function FastTravelMenu() {
  const isOpen = useTravelStore((s) => s.isFastTravelOpen);
  const closeFastTravel = useTravelStore((s) => s.closeFastTravel);
  const isUnlocked = useTravelStore((s) => s.isUnlocked);
  const currentZone = useGameStore((s) => s.currentZone);
  const { travelTo } = useFastTravel();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFastTravel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, closeFastTravel]);

  if (!isOpen) return null;

  // The district you're currently in (outdoor zone, or its parent school zone).
  const here = getDistrict(currentZone)?.id;
  const destinations = FAST_TRAVEL_DESTINATIONS.filter((d) => d.id !== here);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-auto">
      <div className="bg-gray-900/95 rounded-2xl border border-white/10 p-6 shadow-2xl w-[420px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">🚌 Fast Travel</h2>
          <button
            onClick={closeFastTravel}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            Close [Esc]
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {destinations.map((d) => (
            <button
              key={d.id}
              onClick={() => travelTo(d)}
              className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 hover:bg-blue-700 text-left text-white transition-colors"
            >
              <span className="font-semibold">{d.name}</span>
              <span className="text-xs text-gray-300">
                {isUnlocked(d.id) ? 'Visited' : 'New'}
              </span>
            </button>
          ))}
          {destinations.length === 0 && (
            <p className="text-gray-400 text-sm">No other destinations available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
