// apps/web/src/world/town-generator.ts
// Deterministic per-chunk town layout: ground, a grid of streets (shared across
// chunk borders), and lots that are each a building or a park. The origin chunk
// (0,0) is reserved for the school (rendered separately).
import { CHUNK_SIZE, chunkRng } from './chunks';
import { ARCHETYPES, TOWN_TYPES, type TownBuildingType } from '../data/maps/building-archetypes';

const ROAD_W = 8;

export interface RoadSegment {
  x: number;
  z: number;
  width: number;
  depth: number;
}

export interface TownBuildingPlacement {
  id: string;
  type: TownBuildingType;
  x: number;
  z: number;
  rotation: number;
  width: number;
  depth: number;
  floors: number;
}

export interface ParkPlacement {
  x: number;
  z: number;
  size: number;
}

export interface PropPlacement {
  type: 'tree' | 'bench' | 'lamppost' | 'bush' | 'fountain';
  x: number;
  z: number;
}

export interface ChunkData {
  cx: number;
  cz: number;
  isOrigin: boolean;
  center: { x: number; z: number };
  size: number;
  groundColor: string;
  roads: RoadSegment[];
  buildings: TownBuildingPlacement[];
  parks: ParkPlacement[];
  props: PropPlacement[];
}

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length];
}

export function generateChunk(cx: number, cz: number): ChunkData {
  const rng = chunkRng(cx, cz);
  const originX = cx * CHUNK_SIZE;
  const originZ = cz * CHUNK_SIZE;
  const center = { x: originX + CHUNK_SIZE / 2, z: originZ + CHUNK_SIZE / 2 };
  // The 2x2 chunks around the origin are reserved for the school campus
  // (rendered separately) — no town roads/lots/buildings there.
  const isReserved = cx >= -1 && cx <= 0 && cz >= -1 && cz <= 0;

  if (isReserved) {
    return {
      cx,
      cz,
      isOrigin: true,
      center,
      size: CHUNK_SIZE,
      groundColor: '#6f9a55',
      roads: [],
      buildings: [],
      parks: [],
      props: [],
    };
  }

  // Streets along this chunk's south & west edges → a continuous grid.
  const roads: RoadSegment[] = [
    { x: center.x, z: originZ, width: CHUNK_SIZE, depth: ROAD_W },
    { x: originX, z: center.z, width: ROAD_W, depth: CHUNK_SIZE },
  ];

  const props: PropPlacement[] = [];
  // Street trees + lamps along the south road.
  for (let i = 0; i < 4; i++) {
    const x = originX + ROAD_W + 4 + i * 14 + rng() * 3;
    props.push({ type: i % 2 === 0 ? 'tree' : 'lamppost', x, z: originZ + ROAD_W + 1.5 });
  }

  const buildings: TownBuildingPlacement[] = [];
  const parks: ParkPlacement[] = [];

  // 2x2 lots inside the block (leaving road margins on all sides).
  const blockX0 = originX + ROAD_W;
  const blockZ0 = originZ + ROAD_W;
  const cell = (CHUNK_SIZE - 2 * ROAD_W) / 2;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const lx = blockX0 + (col + 0.5) * cell;
      const lz = blockZ0 + (row + 0.5) * cell;
      const idx = row * 2 + col;
      const roll = rng();
      if (roll < 0.25) {
        // Park lot
        parks.push({ x: lx, z: lz, size: cell - 4 });
        const treeN = 3 + Math.floor(rng() * 3);
        for (let t = 0; t < treeN; t++) {
          props.push({ type: 'tree', x: lx + (rng() - 0.5) * (cell - 8), z: lz + (rng() - 0.5) * (cell - 8) });
        }
        if (rng() < 0.5) props.push({ type: 'fountain', x: lx, z: lz });
        props.push({ type: 'bench', x: lx - 3, z: lz + 4 });
      } else {
        const type = pick(TOWN_TYPES, rng());
        const a = ARCHETYPES[type];
        const floors = a.floorsRange[0] + Math.floor(rng() * (a.floorsRange[1] - a.floorsRange[0] + 1));
        buildings.push({
          id: `b_${cx}_${cz}_${idx}`,
          type,
          x: lx,
          z: lz,
          rotation: 0, // door faces +z (toward the south road / player)
          width: a.footprint.width,
          depth: a.footprint.depth,
          floors,
        });
        props.push({ type: 'bush', x: lx - a.footprint.width / 2 + 1, z: lz + a.footprint.depth / 2 + 1 });
      }
    }
  }

  return {
    cx,
    cz,
    isOrigin: false,
    center,
    size: CHUNK_SIZE,
    groundColor: '#6f9a55',
    roads,
    buildings,
    parks,
    props,
  };
}
