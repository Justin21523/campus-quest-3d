// apps/web/src/world/trafficSignal.ts
// Pure, shared traffic-light cycle. The whole city uses one global clock so
// lights and vehicles stay in sync without any store: the x-running roads are
// green for the first half of each period, the z-running roads for the second.

export const LIGHT_PERIOD = 8; // seconds for a full red/green cycle

export function isAxisGreen(elapsed: number, axis: 'x' | 'z'): boolean {
  const firstHalf = elapsed % LIGHT_PERIOD < LIGHT_PERIOD / 2;
  return axis === 'x' ? firstHalf : !firstHalf;
}
