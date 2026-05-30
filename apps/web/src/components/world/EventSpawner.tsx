// apps/web/src/components/world/EventSpawner.tsx
// Non-visual driver for the RandomEventSystem. On an interval, while the player
// is in an outdoor (streamed-town) district and fewer than the cap of events are
// live, it spawns a random event a short distance from the player and prunes any
// that have expired.
import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useEventStore } from '../../store/eventStore';
import { CAMPUS_ZONES } from '../../data/maps';
import { EVENT_DEFINITIONS } from '../../data/events';

const MAX_ACTIVE = 3;
const TICK_MS = 7000;
const SPAWN_CHANCE = 0.6;

export default function EventSpawner() {
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const store = useEventStore.getState();
      store.expire(now);

      const zone = useGameStore.getState().currentZone;
      if (!CAMPUS_ZONES[zone]?.streamedTown) return;
      if (store.activeEvents.length >= MAX_ACTIVE) return;
      if (Math.random() > SPAWN_CHANCE) return;

      const def = EVENT_DEFINITIONS[Math.floor(Math.random() * EVENT_DEFINITIONS.length)];
      const p = useGameStore.getState().playerPosition;
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 8;
      store.spawn(def, zone, {
        x: p.x + Math.cos(angle) * dist,
        z: p.z + Math.sin(angle) * dist,
      });
    };

    const handle = setInterval(tick, TICK_MS);
    return () => clearInterval(handle);
  }, []);

  return null;
}
