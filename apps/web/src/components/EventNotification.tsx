// apps/web/src/components/EventNotification.tsx
// Toast for the RandomEventSystem (mirrors QuestNotification): announces when an
// event spawns and when one is resolved, auto-hiding after 3s. Watches the
// eventStore signal fields so each spawn/resolve fires exactly once.
import { useEffect, useState } from 'react';
import { useEventStore } from '../store/eventStore';
import { getEventDefById } from '../data/events';

type Toast = { text: string; tone: 'spawn' | 'resolve' };

export default function EventNotification() {
  const lastSpawned = useEventStore((s) => s.lastSpawned);
  const lastResolved = useEventStore((s) => s.lastResolved);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!lastSpawned) return;
    const def = getEventDefById(lastSpawned.defId);
    setToast({ text: def?.toast ?? 'Something is happening nearby.', tone: 'spawn' });
    const hide = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(hide);
  }, [lastSpawned]);

  useEffect(() => {
    if (!lastResolved) return;
    const def = getEventDefById(lastResolved.defId);
    setToast({ text: def ? `Resolved: ${def.title}` : 'Event resolved!', tone: 'resolve' });
    const hide = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(hide);
  }, [lastResolved]);

  if (!toast) return null;

  const border = toast.tone === 'resolve' ? 'border-emerald-500 text-emerald-300' : 'border-amber-500 text-amber-300';
  return (
    <div className="absolute top-36 right-4 z-40 animate-slide-in-right">
      <div className={`bg-gray-900/95 border-2 ${border} rounded-lg p-4 shadow-xl backdrop-blur-sm max-w-xs`}>
        <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
          {toast.tone === 'resolve' ? 'Event Complete' : 'Random Event'}
        </div>
        <div className="text-white font-semibold">{toast.text}</div>
      </div>
    </div>
  );
}
