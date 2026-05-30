// apps/web/src/world/playerMovement.ts
// Pure movement/stamina helpers (no R3F/Three imports) so PlayerController stays
// lean and this logic stays unit-testable.
//
// Control scheme: WASD = walk (slow, default). Hold Shift = go fast — the player
// sprints while stamina lasts and degrades to a steady run once depleted. Sprint
// drains stamina; everything else regenerates it.

export type MovementMode = 'walk' | 'run' | 'sprint';

export const WALK_SPEED = 2.5;
export const RUN_SPEED = 5;
export const SPRINT_SPEED = 8;

/** Initial upward velocity applied on jump (m/s). */
export const JUMP_SPEED = 9;
/** Stamina spent per jump. */
export const JUMP_COST = 12;

export const STAMINA_MAX = 100;
/** Stamina drained per second while sprinting. */
export const SPRINT_DRAIN = 25;
/** Stamina regenerated per second while not sprinting. */
export const STAMINA_REGEN = 15;
/**
 * Hysteresis floor: sprint can (re)engage only once stamina climbs back above
 * this, preventing rapid walk/sprint flicker right at empty.
 */
export const SPRINT_MIN = 5;

export interface MovementInput {
  /** Whether there is any horizontal input this frame. */
  moving: boolean;
  /** Whether a sprint modifier (Shift) is held. */
  shift: boolean;
  stamina: number;
  /** Whether the previous frame's mode was 'sprint' (keeps sprint sticky until empty). */
  wasSprinting: boolean;
}

export interface MovementResult {
  mode: MovementMode;
  speed: number;
}

/** Resolve the active movement mode + speed from input and current stamina. */
export function resolveMovement({ moving, shift, stamina, wasSprinting }: MovementInput): MovementResult {
  if (!moving || !shift) return { mode: 'walk', speed: WALK_SPEED };
  const canSprint = stamina > SPRINT_MIN || (wasSprinting && stamina > 0);
  if (canSprint) return { mode: 'sprint', speed: SPRINT_SPEED };
  return { mode: 'run', speed: RUN_SPEED };
}

/** Advance stamina for this frame: drain while sprinting, otherwise regenerate. */
export function updateStamina(stamina: number, mode: MovementMode, dt: number): number {
  const next = mode === 'sprint' ? stamina - SPRINT_DRAIN * dt : stamina + STAMINA_REGEN * dt;
  return Math.max(0, Math.min(STAMINA_MAX, next));
}
