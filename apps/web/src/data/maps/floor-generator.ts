// apps/web/src/data/maps/floor-generator.ts
import type { RoomDefinition, WallSegment } from './room-templates';
import { mulberry32, shuffle, type Rng } from './prng';

// ---------------------------------------------------------------------------
// Deterministic, connected floor-plan generator.
//
// Floors are described by a list of room *specs* (which template, optional
// side); this module computes positions, builds each room's walls with a
// doorway onto a central corridor, and emits the corridor's gap-filling side
// walls. Every room therefore opens onto the corridor, and the corridor runs
// front (entrance) to back (stairwell) — guaranteeing the whole floor is
// walkable. Same seed => same layout. Reused for Phase-2 shop/house interiors.
// ---------------------------------------------------------------------------

export interface RoomSpec {
  id: string;
  template: RoomDefinition;
  /** Force a side; otherwise the packer balances the two columns. */
  side?: 'left' | 'right';
}

export interface FloorSpec {
  level: number;
  name: string;
  roomSpecs: RoomSpec[];
}

export interface BuildingSpec {
  id: string;
  zoneId: string;
  floorHeight: number;
  seed: number;
  corridorWidth?: number;
  shellColor: string;
  roofColor: string;
  corridorFloorColor?: string;
  corridorWallColor?: string;
  floors: FloorSpec[];
}

export interface PlacedRoom extends RoomDefinition {
  id: string;
  x: number;
  z: number;
  baseY: number;
}

export interface GeneratedFloor {
  level: number;
  name: string;
  baseY: number;
  rooms: PlacedRoom[];
  corridorWalls: WallSegment[];
}

export interface GeneratedBuilding {
  id: string;
  zoneId: string;
  floorHeight: number;
  seed: number;
  footprint: { width: number; depth: number };
  corridorWidth: number;
  /** Stair column centre. x is offset to one side so a solid walkway runs beside the hole. */
  stairwell: { x: number; z: number };
  stairWidth: number;
  shellColor: string;
  roofColor: string;
  corridorFloorColor: string;
  corridorWallColor: string;
  floors: GeneratedFloor[];
}

const DEFAULT_CORRIDOR_W = 6;
const ROOM_GAP = 0.8; // gap between stacked rooms in a column
const FRONT_MARGIN = 8; // open entrance hall before the first room
const STAIRWELL_DEPTH = 9; // reserved corridor length for the staircase
const BACK_MARGIN = 2;
const WINDOW_HEIGHT = 1.4;

interface Placement {
  spec: RoomSpec;
  side: 'left' | 'right';
  centerD: number; // distance from the front of the building
  width: number;
  depth: number;
}

/** Build a room's four walls with the doorway on the corridor-facing side. */
function buildRoomWalls(width: number, depth: number, side: 'left' | 'right'): WallSegment[] {
  const doorOnRight = side === 'left'; // a left-column room faces the corridor to its right
  return [
    { x: 0, z: -depth / 2, width, rotation: 0 }, // back (solid)
    { x: 0, z: depth / 2, width, rotation: Math.PI }, // front (solid)
    {
      x: -width / 2,
      z: 0,
      width: depth,
      rotation: Math.PI / 2,
      ...(doorOnRight ? { hasWindow: true, windowHeight: WINDOW_HEIGHT } : { hasDoor: true }),
    },
    {
      x: width / 2,
      z: 0,
      width: depth,
      rotation: -Math.PI / 2,
      ...(doorOnRight ? { hasDoor: true } : { hasWindow: true, windowHeight: WINDOW_HEIGHT }),
    },
  ];
}

/** Pack a floor's rooms into two columns; returns placements + column depth. */
function packFloor(floor: FloorSpec, seed: number): { placements: Placement[]; columnDepth: number; maxRoomW: number } {
  const rng: Rng = mulberry32(seed ^ (floor.level * 0x9e3779b1));
  const order = shuffle([...floor.roomSpecs], rng);

  let leftCursor = FRONT_MARGIN;
  let rightCursor = FRONT_MARGIN;
  let maxRoomW = 0;
  const placements: Placement[] = [];

  for (const spec of order) {
    const width = spec.template.width;
    const depth = spec.template.depth;
    const side: 'left' | 'right' = spec.side ?? (leftCursor <= rightCursor ? 'left' : 'right');
    const cursor = side === 'left' ? leftCursor : rightCursor;
    const centerD = cursor + depth / 2;

    placements.push({ spec, side, centerD, width, depth });
    maxRoomW = Math.max(maxRoomW, width);

    if (side === 'left') leftCursor = cursor + depth + ROOM_GAP;
    else rightCursor = cursor + depth + ROOM_GAP;
  }

  const columnDepth = Math.max(leftCursor, rightCursor) - ROOM_GAP;
  return { placements, columnDepth, maxRoomW };
}

/** Generate solid corridor side-wall segments that fill the gaps between rooms. */
function corridorSideWalls(
  spans: Array<[number, number]>, // world-z [near, far] of rooms on this side, far < near
  sideSign: number,
  corridorWidth: number,
  halfD: number,
): WallSegment[] {
  const xWall = sideSign * (corridorWidth / 2);
  const rotation = sideSign < 0 ? Math.PI / 2 : -Math.PI / 2;
  // Sort occupied intervals ascending by their lower (back) z.
  const occ = spans.map(([near, far]) => [Math.min(near, far), Math.max(near, far)] as [number, number]);
  occ.sort((a, b) => a[0] - b[0]);

  const walls: WallSegment[] = [];
  let cursor = -halfD;
  for (const [lo, hi] of occ) {
    if (lo - cursor > 0.05) {
      const len = lo - cursor;
      walls.push({ x: xWall, z: (cursor + lo) / 2, width: len, rotation });
    }
    cursor = Math.max(cursor, hi);
  }
  if (halfD - cursor > 0.05) {
    const len = halfD - cursor;
    walls.push({ x: xWall, z: (cursor + halfD) / 2, width: len, rotation });
  }
  return walls;
}

export function generateBuilding(spec: BuildingSpec): GeneratedBuilding {
  const corridorWidth = spec.corridorWidth ?? DEFAULT_CORRIDOR_W;

  // Pass 1: pack every floor independently.
  const packed = spec.floors.map((floor) => ({ floor, ...packFloor(floor, spec.seed) }));

  // Pass 2: derive a single footprint + stairwell shared by all floors so they
  // stack perfectly (shorter floors simply leave open corridor toward the back).
  const columnDepth = Math.max(...packed.map((p) => p.columnDepth));
  const maxRoomW = Math.max(...packed.map((p) => p.maxRoomW));
  const footprintWidth = corridorWidth + 2 * maxRoomW;
  const footprintDepth = columnDepth + STAIRWELL_DEPTH + BACK_MARGIN;
  const halfD = footprintDepth / 2;
  const worldZ = (d: number) => halfD - d;

  const stairwellCenterD = columnDepth + STAIRWELL_DEPTH / 2;
  // Stairs hug the left corridor wall, leaving a solid walkway on the right so
  // the player can always pass the stairwell hole and step off at the top.
  const stairWidth = Math.min(corridorWidth - 1.4, 3.2);
  const stairwellX = -(corridorWidth / 2 - stairWidth / 2 - 0.15);
  const stairwell = { x: stairwellX, z: worldZ(stairwellCenterD) };

  // Pass 3: place rooms in world space and build corridor walls per floor.
  const floors: GeneratedFloor[] = packed.map(({ floor, placements }) => {
    const baseY = floor.level * spec.floorHeight;
    const rooms: PlacedRoom[] = [];
    const leftSpans: Array<[number, number]> = [];
    const rightSpans: Array<[number, number]> = [];

    for (const p of placements) {
      const sideSign = p.side === 'left' ? -1 : 1;
      const centerX = sideSign * (corridorWidth / 2 + p.width / 2);
      const centerZ = worldZ(p.centerD);
      const span: [number, number] = [centerZ + p.depth / 2, centerZ - p.depth / 2];
      (p.side === 'left' ? leftSpans : rightSpans).push(span);

      rooms.push({
        ...p.spec.template,
        id: p.spec.id,
        x: centerX,
        z: centerZ,
        baseY,
        walls: buildRoomWalls(p.width, p.depth, p.side),
      });
    }

    const corridorWalls = [
      ...corridorSideWalls(leftSpans, -1, corridorWidth, halfD),
      ...corridorSideWalls(rightSpans, 1, corridorWidth, halfD),
    ];

    return { level: floor.level, name: floor.name, baseY, rooms, corridorWalls };
  });

  return {
    id: spec.id,
    zoneId: spec.zoneId,
    floorHeight: spec.floorHeight,
    seed: spec.seed,
    footprint: { width: footprintWidth, depth: footprintDepth },
    corridorWidth,
    stairwell,
    stairWidth,
    shellColor: spec.shellColor,
    roofColor: spec.roofColor,
    corridorFloorColor: spec.corridorFloorColor ?? '#9ca3af',
    corridorWallColor: spec.corridorWallColor ?? '#e5e7eb',
    floors,
  };
}
