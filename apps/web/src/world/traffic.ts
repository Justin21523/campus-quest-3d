// apps/web/src/world/traffic.ts
// Deterministic, framework-free ambient-traffic layout for one streamed town
// chunk. Mirrors town-generator.ts: every chunk owns its south road (centreline
// z = cz*64, running along x) and west road (centreline x = cx*64, running along
// z), each ROAD_W wide, meeting at the corner (cx*64, cz*64). From these we
// derive sidewalks, crosswalks, traffic lights, and looping vehicles/pedestrians.
//
// Nothing here has physics — traffic is purely visual and never blocks or hits
// the kinematic player. Vehicles/pedestrians carry an `axis` so the renderer can
// freeze them on a red light via isAxisGreen() and a `phase` so each one starts
// at a different point in its loop. Counts are capped per chunk for FPS.
import { CHUNK_SIZE, chunkRng } from './chunks';

const ROAD_W = 8;
/** Half-width of a single driving lane offset from the centreline. */
const LANE = 2;
/** Distance from the road centreline to the sidewalk centre. */
const SIDEWALK_OFFSET = 6;

export type RoadAxis = 'x' | 'z';
export type VehicleKind = 'car' | 'bus' | 'bike';

/** A thin gray walking strip running parallel to a road. */
export interface SidewalkStrip {
  x: number;
  z: number;
  /** Box extent along world x. */
  width: number;
  /** Box extent along world z. */
  depth: number;
}

/** A zebra-stripe patch crossing one road near the intersection. */
export interface CrosswalkPatch {
  x: number;
  z: number;
  /** The road axis this crosswalk crosses (stripes run perpendicular to it). */
  axis: RoadAxis;
}

/** A pole + signal head at the intersection, one per road axis. */
export interface TrafficLightSpec {
  x: number;
  z: number;
  axis: RoadAxis;
}

/** A vehicle looping along one road's lane. */
export interface VehicleSpec {
  id: string;
  axis: RoadAxis;
  kind: VehicleKind;
  color: string;
  /** Signed perpendicular lane offset (e.g. +LANE / -LANE). */
  lane: number;
  /** Travel direction along the axis: +1 toward larger coord, -1 toward smaller. */
  dir: 1 | -1;
  /** Units per second. */
  speed: number;
  /** Initial progress along the chunk span, in [0, CHUNK_SIZE). */
  phase: number;
}

/** A pedestrian strolling a sidewalk lane. */
export interface PedestrianSpec {
  id: string;
  axis: RoadAxis;
  color: string;
  /** Signed perpendicular sidewalk offset. */
  lane: number;
  dir: 1 | -1;
  speed: number;
  phase: number;
}

export interface ChunkTraffic {
  sidewalks: SidewalkStrip[];
  crosswalks: CrosswalkPatch[];
  trafficLights: TrafficLightSpec[];
  vehicles: VehicleSpec[];
  pedestrians: PedestrianSpec[];
}

const EMPTY: ChunkTraffic = {
  sidewalks: [],
  crosswalks: [],
  trafficLights: [],
  vehicles: [],
  pedestrians: [],
};

const VEHICLE_PALETTE = ['#d94f4f', '#3f6fd9', '#e0e0e0', '#2f9e57', '#222831', '#e6a23c'];
const PED_PALETTE = ['#c95b8b', '#4f8fd9', '#5aa469', '#d9a23f', '#8a6fd9'];

function pick<T>(arr: T[], r: number): T {
  return arr[Math.floor(r * arr.length) % arr.length];
}

/**
 * Build the ambient-traffic layout for a chunk. Returns empty data for the
 * reserved school chunks (cx∈[-1,0], cz∈[-1,0]) which have no town roads.
 */
export function generateChunkTraffic(cx: number, cz: number): ChunkTraffic {
  const isReserved = cx >= -1 && cx <= 0 && cz >= -1 && cz <= 0;
  if (isReserved) return EMPTY;

  const rng = chunkRng(cx, cz + 9973); // distinct stream from town-generator
  const originX = cx * CHUNK_SIZE;
  const originZ = cz * CHUNK_SIZE;
  const centerX = originX + CHUNK_SIZE / 2;
  const centerZ = originZ + CHUNK_SIZE / 2;

  // --- Sidewalks: a strip on each side of both roads. ---
  const sidewalks: SidewalkStrip[] = [
    // South road (along x at z = originZ): strips offset in z.
    { x: centerX, z: originZ + SIDEWALK_OFFSET, width: CHUNK_SIZE, depth: 2 },
    { x: centerX, z: originZ - SIDEWALK_OFFSET, width: CHUNK_SIZE, depth: 2 },
    // West road (along z at x = originX): strips offset in x.
    { x: originX + SIDEWALK_OFFSET, z: centerZ, width: 2, depth: CHUNK_SIZE },
    { x: originX - SIDEWALK_OFFSET, z: centerZ, width: 2, depth: CHUNK_SIZE },
  ];

  // --- Crosswalks: one across each road, just past the intersection corner. ---
  const crosswalks: CrosswalkPatch[] = [
    { x: originX + ROAD_W + 4, z: originZ, axis: 'x' },
    { x: originX, z: originZ + ROAD_W + 4, axis: 'z' },
  ];

  // --- Traffic lights: a pole per axis at the intersection corner. ---
  const trafficLights: TrafficLightSpec[] = [
    { x: originX + SIDEWALK_OFFSET, z: originZ + SIDEWALK_OFFSET, axis: 'x' },
    { x: originX - SIDEWALK_OFFSET, z: originZ - SIDEWALK_OFFSET, axis: 'z' },
  ];

  // --- Vehicles: 1–2 per road, on opposite lanes/directions. ---
  const vehicles: VehicleSpec[] = [];
  const roads: RoadAxis[] = ['x', 'z'];
  for (const axis of roads) {
    const count = 1 + Math.floor(rng() * 2); // 1 or 2
    for (let i = 0; i < count; i++) {
      const dir: 1 | -1 = rng() < 0.5 ? 1 : -1;
      const lane = dir > 0 ? LANE : -LANE; // drive on the side matching direction
      const kindRoll = rng();
      const kind: VehicleKind = kindRoll < 0.18 ? 'bus' : kindRoll < 0.34 ? 'bike' : 'car';
      const speed = kind === 'bus' ? 5 + rng() * 2 : kind === 'bike' ? 4 + rng() * 2 : 7 + rng() * 4;
      vehicles.push({
        id: `v_${cx}_${cz}_${axis}_${i}`,
        axis,
        kind,
        color: kind === 'bus' ? '#f2c94c' : pick(VEHICLE_PALETTE, rng()),
        lane,
        dir,
        speed,
        phase: rng() * CHUNK_SIZE,
      });
    }
  }

  // --- Pedestrians: 1–2 strolling the sidewalks. ---
  const pedestrians: PedestrianSpec[] = [];
  for (const axis of roads) {
    const count = 1 + Math.floor(rng() * 2);
    for (let i = 0; i < count; i++) {
      const dir: 1 | -1 = rng() < 0.5 ? 1 : -1;
      const lane = (rng() < 0.5 ? 1 : -1) * SIDEWALK_OFFSET;
      pedestrians.push({
        id: `p_${cx}_${cz}_${axis}_${i}`,
        axis,
        color: pick(PED_PALETTE, rng()),
        lane,
        dir,
        speed: 1.2 + rng() * 0.8,
        phase: rng() * CHUNK_SIZE,
      });
    }
  }

  return { sidewalks, crosswalks, trafficLights, vehicles, pedestrians };
}
