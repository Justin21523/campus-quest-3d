// apps/web/src/world/collectibles.ts
// Deterministic per-chunk hidden-collectible spawner. Mirrors town-generator.ts:
// same chunk coords always yield the same collectibles, so picking one up (and
// remembering it via collectibleStore) is stable across chunk reloads.
import { COLLECTIBLE_ITEM_IDS } from '@campus-quest/game-data';
import { CHUNK_SIZE, chunkRng } from './chunks';

export interface CollectiblePlacement {
  id: string;
  itemId: string;
  x: number;
  z: number;
}

/** The 2x2 chunks around the origin are the school campus (no town collectibles). */
function isReserved(cx: number, cz: number): boolean {
  return cx >= -1 && cx <= 0 && cz >= -1 && cz <= 0;
}

export function generateChunkCollectibles(cx: number, cz: number): CollectiblePlacement[] {
  if (isReserved(cx, cz) || COLLECTIBLE_ITEM_IDS.length === 0) return [];

  // Independent RNG stream (chunkRng builds a fresh generator each call).
  const rng = chunkRng(cx, cz + 0x517cc1b7);
  const count = Math.floor(rng() * 3); // 0–2 per chunk
  const originX = cx * CHUNK_SIZE;
  const originZ = cz * CHUNK_SIZE;
  const margin = 6;

  const out: CollectiblePlacement[] = [];
  for (let i = 0; i < count; i++) {
    const x = originX + margin + rng() * (CHUNK_SIZE - 2 * margin);
    const z = originZ + margin + rng() * (CHUNK_SIZE - 2 * margin);
    const itemId = COLLECTIBLE_ITEM_IDS[Math.floor(rng() * COLLECTIBLE_ITEM_IDS.length)];
    out.push({ id: `col_${cx}_${cz}_${i}`, itemId, x, z });
  }
  return out;
}
