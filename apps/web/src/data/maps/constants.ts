// apps/web/src/data/maps/constants.ts
// Shared building/floor constants in their own module so both `campus-zones`
// and the building registry (`buildings.ts`) can import them without forming a
// circular dependency.

export const FLOOR_HEIGHT = 6;

/** World Y of a floor's walking surface, derived from its level. */
export function floorBaseY(level: number): number {
  return level * FLOOR_HEIGHT;
}

/** Inverse of {@link floorBaseY}: which floor level a world Y sits on (clamped at ground). */
export function getFloorFromY(y: number): number {
  return Math.max(0, Math.round(y / FLOOR_HEIGHT));
}
