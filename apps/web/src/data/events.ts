// apps/web/src/data/events.ts
// RandomEventSystem definitions (web-local so adding events doesn't churn the
// shared game-data build). Each event is a short-lived encounter that spawns
// near the player in an outdoor district: walk up, press E to resolve it for a
// reward, or ignore it and it expires on its own.
import type { Reward } from '../world/reward';

export type EventKind =
  | 'lost_item'
  | 'traffic'
  | 'library_glitch'
  | 'club_emergency'
  | 'rumor';

export interface EventDefinition {
  id: string;
  title: string;
  description: string;
  kind: EventKind;
  /** Short line shown when the event spawns. */
  toast: string;
  /** How long it stays before expiring (ms). */
  durationMs: number;
  reward: Reward;
}

export const EVENT_DEFINITIONS: EventDefinition[] = [
  {
    id: 'ev_lost_wallet',
    title: 'Lost Wallet',
    description: 'A classmate dropped their wallet on the sidewalk.',
    kind: 'lost_item',
    toast: 'Someone dropped something nearby...',
    durationMs: 45000,
    reward: { items: [{ id: 'star_coin', qty: 1 }], friendship: { npcId: 'mei', amount: 5 } },
  },
  {
    id: 'ev_traffic_help',
    title: 'Traffic Jam',
    description: 'Help wave the buses through a tangled intersection.',
    kind: 'traffic',
    toast: 'The intersection is gridlocked!',
    durationMs: 40000,
    reward: { stamina: 20 },
  },
  {
    id: 'ev_library_glitch',
    title: 'Library Terminal Glitch',
    description: 'A study terminal is flickering with corrupted data.',
    kind: 'library_glitch',
    toast: 'A nearby terminal is glitching out.',
    durationMs: 50000,
    reward: { items: [{ id: 'data_fragment', qty: 1 }], friendship: { npcId: 'alice', amount: 5 } },
  },
  {
    id: 'ev_club_flyers',
    title: 'Club Flyer Rush',
    description: 'The club needs a hand handing out flyers before the bell.',
    kind: 'club_emergency',
    toast: 'The club is short-handed!',
    durationMs: 40000,
    reward: { items: [{ id: 'club_flyer', qty: 2 }], friendship: { npcId: 'bob', amount: 5 } },
  },
  {
    id: 'ev_campus_rumor',
    title: 'Whispered Rumor',
    description: 'Students are gossiping about the missing semester.',
    kind: 'rumor',
    toast: 'You overhear an intriguing rumor.',
    durationMs: 35000,
    reward: { items: [{ id: 'rumor_note', qty: 1 }] },
  },
  {
    id: 'ev_snack_share',
    title: 'Shared Snacks',
    description: 'A vendor is giving out free energy drinks.',
    kind: 'lost_item',
    toast: 'Free snacks being handed out nearby!',
    durationMs: 35000,
    reward: { items: [{ id: 'energy_drink', qty: 1 }], stamina: 10 },
  },
];

export function getEventDefById(id: string): EventDefinition | undefined {
  return EVENT_DEFINITIONS.find((e) => e.id === id);
}
