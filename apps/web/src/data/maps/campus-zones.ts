// apps/web/src/data/maps/campus-zones.ts
import { ROOM_TEMPLATES } from './room-templates';
import type { OutdoorAreaDefinition } from './outdoor-templates';
import { generateBuilding, type BuildingSpec, type GeneratedBuilding } from './floor-generator';
import { FLOOR_HEIGHT } from './constants';
import { CAMPUS_BUILDINGS } from './buildings';
import { DISTRICT_BUILDINGS, SCHOOL_DISTRICTS } from './schools';

// ---------------------------------------------------------------------------
// Dynamic, data-driven building model.
// A floor is just a list of room *specs*; the generator (floor-generator.ts)
// computes positions, doorways and a connecting corridor. The number of floors
// and rooms is not hardcoded — add a floor / room spec and everything (shell,
// slabs, staircases, footprint) follows.
//
// Floor constants live in `constants.ts` (so `buildings.ts` can share them
// without a circular import); they are re-exported here for existing importers.
// ---------------------------------------------------------------------------

export { FLOOR_HEIGHT, floorBaseY, getFloorFromY } from './constants';
export type { GeneratedBuilding } from './floor-generator';

const T = ROOM_TEMPLATES;

export const MAIN_BUILDING_SPEC: BuildingSpec = {
  id: 'main_building',
  zoneId: 'main_building_1f',
  floorHeight: FLOOR_HEIGHT,
  seed: 0x5747a1,
  corridorWidth: 6,
  shellColor: '#d9cbb2',
  roofColor: '#7c5c3b',
  corridorFloorColor: '#9ca3af',
  corridorWallColor: '#e5e7eb',
  floors: [
    {
      level: 0,
      name: '1F — Entrance & Library',
      roomSpecs: [
        { id: 'room_class_a', template: T.classroom_standard },
        { id: 'room_class_b', template: T.classroom_standard },
        { id: 'room_library', template: T.library_reading },
        { id: 'room_cafe', template: T.shop_cafe },
        { id: 'room_restroom_1f', template: T.restroom },
      ],
    },
    {
      level: 1,
      name: '2F — Classrooms & Labs',
      roomSpecs: [
        { id: 'room_class_c', template: T.classroom_standard },
        { id: 'room_class_d', template: T.classroom_standard },
        { id: 'room_computer_lab', template: T.computer_lab },
        { id: 'room_science_lab_2f', template: T.science_lab },
        { id: 'room_lounge', template: T.teacher_lounge },
        { id: 'room_restroom_2f', template: T.restroom },
      ],
    },
    {
      level: 2,
      name: '3F — Office, Gym & Dorms',
      roomSpecs: [
        { id: 'room_office_principal', template: T.office_single },
        { id: 'room_gym', template: T.gym_hall },
        { id: 'room_dorm_a', template: T.dorm_room },
        { id: 'room_dorm_b', template: T.dorm_room },
        { id: 'room_restroom_3f', template: T.restroom },
      ],
    },
  ],
};

export const MAIN_BUILDING: GeneratedBuilding = generateBuilding(MAIN_BUILDING_SPEC);

export interface ZoneDefinition {
  id: string;
  name: string;
  ambientLightIntensity: number;
  fogColor?: string;
  spawnPoint: { x: number; y: number; z: number };
  outdoorArea?: OutdoorAreaDefinition;
  /** When set, render the full generated building. */
  building?: GeneratedBuilding;
  /** When set, render the streamed infinite town (chunks) + school exterior. */
  streamedTown?: boolean;
}

// Spawn just inside the front entrance, on the corridor axis.
const ENTRANCE_Z = MAIN_BUILDING.footprint.depth / 2 - 3;

export const CAMPUS_ZONES: Record<string, ZoneDefinition> = {
  main_building_1f: {
    id: 'main_building_1f',
    name: 'Main Building',
    ambientLightIntensity: 0.6,
    fogColor: '#e8e0d0',
    spawnPoint: { x: 0, y: 0, z: ENTRANCE_Z },
    building: MAIN_BUILDING,
  },

  campus_outdoor: {
    id: 'campus_outdoor',
    name: 'Town',
    ambientLightIntensity: 0.8,
    spawnPoint: { x: 0, y: 0, z: 8 },
    streamedTown: true,
  },

  // Themed campus buildings (their interiors come from the building registry).
  // Spawn just inside each front entrance, on the corridor axis.
  library_building: {
    id: 'library_building',
    name: 'Starbridge Library',
    ambientLightIntensity: 0.6,
    fogColor: '#e8e0d0',
    spawnPoint: { x: 0, y: 0, z: CAMPUS_BUILDINGS.library_building.footprint.depth / 2 - 3 },
    building: CAMPUS_BUILDINGS.library_building,
  },
  academic_building: {
    id: 'academic_building',
    name: 'Science Hall',
    ambientLightIntensity: 0.6,
    fogColor: '#e6ecf2',
    spawnPoint: { x: 0, y: 0, z: CAMPUS_BUILDINGS.academic_building.footprint.depth / 2 - 3 },
    building: CAMPUS_BUILDINGS.academic_building,
  },
  club_building: {
    id: 'club_building',
    name: 'Club House',
    ambientLightIntensity: 0.6,
    fogColor: '#efe2e8',
    spawnPoint: { x: 0, y: 0, z: CAMPUS_BUILDINGS.club_building.footprint.depth / 2 - 3 },
    building: CAMPUS_BUILDINGS.club_building,
  },

  // --- Other school districts (separate streamed-town zones) ---------------
  // Reached by fast travel (bus stop / map). Each has a distinct fog/light mood
  // and one generated school building reached via its front-door portal.
  riverside_outdoor: {
    id: 'riverside_outdoor',
    name: SCHOOL_DISTRICTS.riverside_outdoor.name,
    ambientLightIntensity: SCHOOL_DISTRICTS.riverside_outdoor.ambientLightIntensity,
    fogColor: SCHOOL_DISTRICTS.riverside_outdoor.fogColor,
    spawnPoint: SCHOOL_DISTRICTS.riverside_outdoor.spawn,
    streamedTown: true,
  },
  riverside_school: {
    id: 'riverside_school',
    name: 'Riverside High',
    ambientLightIntensity: 0.6,
    fogColor: '#e6eef2',
    spawnPoint: { x: 0, y: 0, z: DISTRICT_BUILDINGS.riverside_school.footprint.depth / 2 - 3 },
    building: DISTRICT_BUILDINGS.riverside_school,
  },
  northhill_outdoor: {
    id: 'northhill_outdoor',
    name: SCHOOL_DISTRICTS.northhill_outdoor.name,
    ambientLightIntensity: SCHOOL_DISTRICTS.northhill_outdoor.ambientLightIntensity,
    fogColor: SCHOOL_DISTRICTS.northhill_outdoor.fogColor,
    spawnPoint: SCHOOL_DISTRICTS.northhill_outdoor.spawn,
    streamedTown: true,
  },
  northhill_school: {
    id: 'northhill_school',
    name: 'Northhill Science School',
    ambientLightIntensity: 0.6,
    fogColor: '#eef2e7',
    spawnPoint: { x: 0, y: 0, z: DISTRICT_BUILDINGS.northhill_school.footprint.depth / 2 - 3 },
    building: DISTRICT_BUILDINGS.northhill_school,
  },

  // Transient zone for on-entry generated town interiors (the building itself
  // lives in gameStore.interior). Spawn fallback near a generated entrance.
  interior: {
    id: 'interior',
    name: 'Interior',
    ambientLightIntensity: 0.6,
    spawnPoint: { x: 0, y: 0, z: 5 },
  },
};

/** Front-entrance world Z of the main building (door + spawn alignment). */
export const MAIN_BUILDING_ENTRANCE_Z = MAIN_BUILDING.footprint.depth / 2;
