// apps/web/src/data/maps/building-archetypes.ts
// Town building types: how the exterior looks + how the (on-entry) interior is
// generated. Interiors reuse generateBuilding(floor-generator) so shops/homes
// get the same procedural, connected, multi-floor layout as the school.
import { ROOM_TEMPLATES } from './room-templates';
import { mulberry32, hashString } from './prng';
import type { BuildingSpec, RoomSpec } from './floor-generator';

export type TownBuildingType = 'shop' | 'cafe' | 'house' | 'apartment';

export const TOWN_TYPES: TownBuildingType[] = ['shop', 'cafe', 'house', 'apartment'];

const INTERIOR_FLOOR_HEIGHT = 6;
const INTERIOR_CORRIDOR_WIDTH = 5;

export interface TownArchetype {
  label: string;
  shellColor: string;
  roofColor: string;
  /** Exterior footprint (visual box in the town). */
  footprint: { width: number; depth: number };
  floorsRange: [number, number];
  /** Template keys the interior draws rooms from. */
  pool: string[];
  /** Rooms per interior floor. */
  perFloor: [number, number];
}

export const ARCHETYPES: Record<TownBuildingType, TownArchetype> = {
  shop: {
    label: 'SHOP',
    shellColor: '#c98a5b',
    roofColor: '#5b3a26',
    footprint: { width: 17, depth: 15 },
    floorsRange: [1, 2],
    pool: ['shop_floor', 'shop_floor', 'office_single', 'restroom'],
    perFloor: [3, 4],
  },
  cafe: {
    label: 'CAFE',
    shellColor: '#b9743c',
    roofColor: '#6b3f1e',
    footprint: { width: 16, depth: 14 },
    floorsRange: [1, 2],
    pool: ['dining_hall', 'shop_floor', 'restroom', 'teacher_lounge'],
    perFloor: [2, 3],
  },
  house: {
    label: 'HOME',
    shellColor: '#a9b18f',
    roofColor: '#7a4b30',
    footprint: { width: 14, depth: 13 },
    floorsRange: [1, 2],
    pool: ['apartment_living', 'dorm_room', 'restroom'],
    perFloor: [2, 3],
  },
  apartment: {
    label: 'APARTMENTS',
    shellColor: '#9aa6b2',
    roofColor: '#4a5560',
    footprint: { width: 18, depth: 15 },
    floorsRange: [2, 3],
    pool: ['dorm_room', 'dorm_room', 'apartment_living', 'restroom'],
    perFloor: [3, 4],
  },
};

/** Build a gener-able interior BuildingSpec for one town building (deterministic by id). */
export function buildInteriorSpec(type: TownBuildingType, buildingId: string, zoneId: string): BuildingSpec {
  const a = ARCHETYPES[type];
  const rng = mulberry32(hashString(`${buildingId}:interior`));
  const floorCount = a.floorsRange[0] + Math.floor(rng() * (a.floorsRange[1] - a.floorsRange[0] + 1));

  const floors = [];
  for (let level = 0; level < floorCount; level++) {
    const roomN = a.perFloor[0] + Math.floor(rng() * (a.perFloor[1] - a.perFloor[0] + 1));
    const roomSpecs: RoomSpec[] = [];
    for (let i = 0; i < roomN; i++) {
      const key = a.pool[Math.floor(rng() * a.pool.length)];
      roomSpecs.push({ id: `${buildingId}_f${level}_r${i}`, template: ROOM_TEMPLATES[key] });
    }
    floors.push({ level, name: `${a.label} ${level + 1}F`, roomSpecs });
  }

  return {
    id: buildingId,
    zoneId,
    floorHeight: INTERIOR_FLOOR_HEIGHT,
    corridorWidth: INTERIOR_CORRIDOR_WIDTH,
    seed: hashString(`${buildingId}:layout`),
    shellColor: a.shellColor,
    roofColor: a.roofColor,
    floors,
  };
}
