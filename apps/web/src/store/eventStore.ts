// apps/web/src/store/eventStore.ts
// RandomEventSystem runtime state (transient — not persisted). Holds the events
// currently live in the world plus small "signal" fields the toast component
// watches to announce spawns/resolutions.
import { create } from 'zustand';
import type { EventDefinition } from '../data/events';

export interface ActiveEvent {
  /** Unique per spawned instance. */
  id: string;
  defId: string;
  zone: string;
  x: number;
  z: number;
  expiresAt: number;
}

/** A change-detectable signal for the toast (key bumps on each spawn/resolve). */
export interface EventSignal {
  key: number;
  defId: string;
}

interface EventState {
  activeEvents: ActiveEvent[];
  lastSpawned: EventSignal | null;
  lastResolved: EventSignal | null;

  spawn: (def: EventDefinition, zone: string, pos: { x: number; z: number }) => void;
  resolve: (id: string) => void;
  expire: (now: number) => void;
}

let instanceCounter = 0;
let signalCounter = 0;

export const useEventStore = create<EventState>((set) => ({
  activeEvents: [],
  lastSpawned: null,
  lastResolved: null,

  spawn: (def, zone, pos) =>
    set((s) => ({
      activeEvents: [
        ...s.activeEvents,
        {
          id: `${def.id}_${instanceCounter++}`,
          defId: def.id,
          zone,
          x: pos.x,
          z: pos.z,
          expiresAt: Date.now() + def.durationMs,
        },
      ],
      lastSpawned: { key: signalCounter++, defId: def.id },
    })),

  resolve: (id) =>
    set((s) => {
      const ev = s.activeEvents.find((e) => e.id === id);
      if (!ev) return s;
      return {
        activeEvents: s.activeEvents.filter((e) => e.id !== id),
        lastResolved: { key: signalCounter++, defId: ev.defId },
      };
    }),

  expire: (now) =>
    set((s) => {
      const remaining = s.activeEvents.filter((e) => e.expiresAt > now);
      return remaining.length === s.activeEvents.length ? s : { activeEvents: remaining };
    }),
}));
