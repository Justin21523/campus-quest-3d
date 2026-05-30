// apps/web/src/world/spawn.ts
// Safe-spawn helper: probe the physics world downward to find the real floor
// surface under an (x, z) target so the player is always seated on solid ground
// instead of trusting a static spawnPoint.y (which can leave it under the floor
// or above a missing slab). Used by PlayerController for spawns, zone teleports
// and fall respawns.
import type { World, Collider, Ray, Vector } from '@dimforge/rapier3d-compat';

/**
 * Minimal structural view of the runtime Rapier module (`useRapier().rapier`):
 * we only need the `Ray` constructor. Typing it structurally avoids coupling to
 * the exact module-namespace type, which differs from `typeof import(...)`.
 */
interface RayFactory {
  Ray: new (origin: Vector, dir: Vector) => Ray;
}

/** How far above the spawn target the downward probe ray starts. */
export const SPAWN_PROBE_HEIGHT = 6;

/**
 * Cast a ray straight down from `(x, fromY, z)` and return the world Y of the
 * first solid surface hit, or `null` if nothing is within `maxDistance`.
 *
 * @param excludeCollider the player's own collider, so the ray ignores it.
 */
export function findGroundY(
  rapier: RayFactory,
  world: World,
  x: number,
  z: number,
  fromY: number,
  excludeCollider?: Collider | null,
  maxDistance = 60,
): number | null {
  const ray = new rapier.Ray({ x, y: fromY, z }, { x: 0, y: -1, z: 0 });
  const hit = world.castRay(
    ray,
    maxDistance,
    true, // treat colliders as solid so we hit their surface
    undefined,
    undefined,
    excludeCollider ?? undefined,
  );
  if (!hit) return null;
  return fromY - hit.timeOfImpact;
}
