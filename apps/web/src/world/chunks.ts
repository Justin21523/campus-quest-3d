// apps/web/src/world/chunks.ts
// World-grid chunk math + deterministic per-chunk seeding for the streamed town.
import { mulberry32, hashString, type Rng } from '../data/maps/prng';

export const CHUNK_SIZE = 64;
/** How many chunks out (Chebyshev) to keep loaded around the player. */
export const CHUNK_LOAD_RADIUS = 2;
export const WORLD_SEED = 0x7a1c3;

export interface ChunkCoord {
  cx: number;
  cz: number;
}

export function chunkKey(cx: number, cz: number): string {
  return `${cx},${cz}`;
}

export function worldToChunk(x: number, z: number): ChunkCoord {
  return { cx: Math.floor(x / CHUNK_SIZE), cz: Math.floor(z / CHUNK_SIZE) };
}

/** World-space centre of a chunk. */
export function chunkCenter(cx: number, cz: number): { x: number; z: number } {
  return { x: cx * CHUNK_SIZE + CHUNK_SIZE / 2, z: cz * CHUNK_SIZE + CHUNK_SIZE / 2 };
}

/** Deterministic RNG for a chunk — same coords always yield the same town. */
export function chunkRng(cx: number, cz: number): Rng {
  return mulberry32(hashString(`${WORLD_SEED}:${cx}:${cz}`));
}

/** Chunk coords within the load radius of the player's chunk. */
export function chunksInRadius(cx: number, cz: number, radius = CHUNK_LOAD_RADIUS): ChunkCoord[] {
  const out: ChunkCoord[] = [];
  for (let dz = -radius; dz <= radius; dz++) {
    for (let dx = -radius; dx <= radius; dx++) {
      out.push({ cx: cx + dx, cz: cz + dz });
    }
  }
  return out;
}
