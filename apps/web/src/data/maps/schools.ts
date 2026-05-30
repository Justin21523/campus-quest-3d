// apps/web/src/data/maps/schools.ts
// SchoolDistrictSystem: each district is its own streamed-town outdoor zone with
// a distinct mood (fog/light), one generated school building (interior zone), and
// a bus stop near the spawn for fast travel. STARBRIDGE is the home district
// (reuses campus_outdoor + the existing main/library/academic/club buildings);
// RIVERSIDE and NORTHHILL are new districts each with their own school.
//
// This module is self-contained (it only depends on the building generator and
// room templates) so campus-zones.ts / zone-connections.ts can import it without
// a circular dependency.
import { generateBuilding, type BuildingSpec, type GeneratedBuilding } from './floor-generator';
import { ROOM_TEMPLATES as T } from './room-templates';
import { FLOOR_HEIGHT } from './constants';
import { CAMPUS_BUILDING_LAYOUTS, type CampusBuildingLayout } from './buildings';

// --- Generated school buildings for the two new districts ------------------

export const RIVERSIDE_BUILDING_SPEC: BuildingSpec = {
  id: 'riverside_school',
  zoneId: 'riverside_school',
  floorHeight: FLOOR_HEIGHT,
  seed: 0x4e22c9,
  corridorWidth: 6,
  shellColor: '#aac6d8',
  roofColor: '#3d5a73',
  corridorFloorColor: '#8fa6b5',
  corridorWallColor: '#e7f0f6',
  floors: [
    {
      level: 0,
      name: '1F — Classrooms',
      roomSpecs: [
        { id: 'rv_class_a', template: T.classroom_standard },
        { id: 'rv_class_b', template: T.classroom_standard },
        { id: 'rv_cafe', template: T.shop_cafe },
        { id: 'rv_restroom_1f', template: T.restroom },
      ],
    },
    {
      level: 1,
      name: '2F — Study & Clubs',
      roomSpecs: [
        { id: 'rv_study', template: T.study_hall },
        { id: 'rv_club', template: T.club_room },
        { id: 'rv_lounge', template: T.teacher_lounge },
        { id: 'rv_restroom_2f', template: T.restroom },
      ],
    },
  ],
};

export const NORTHHILL_BUILDING_SPEC: BuildingSpec = {
  id: 'northhill_school',
  zoneId: 'northhill_school',
  floorHeight: FLOOR_HEIGHT,
  seed: 0x6f3b1d,
  corridorWidth: 6,
  shellColor: '#cdd6c2',
  roofColor: '#4f5a3d',
  corridorFloorColor: '#a3ab97',
  corridorWallColor: '#eef2e7',
  floors: [
    {
      level: 0,
      name: '1F — Lecture & Labs',
      roomSpecs: [
        { id: 'nh_lecture', template: T.lecture_hall },
        { id: 'nh_computer_lab', template: T.computer_lab },
        { id: 'nh_science_lab', template: T.science_lab },
        { id: 'nh_restroom_1f', template: T.restroom },
      ],
    },
    {
      level: 1,
      name: '2F — Research',
      roomSpecs: [
        { id: 'nh_lab_b', template: T.science_lab },
        { id: 'nh_office_a', template: T.office_single },
        { id: 'nh_lounge', template: T.teacher_lounge },
        { id: 'nh_restroom_2f', template: T.restroom },
      ],
    },
    {
      level: 2,
      name: '3F — Archives',
      roomSpecs: [
        { id: 'nh_archive', template: T.archive_room },
        { id: 'nh_study', template: T.study_hall },
        { id: 'nh_office_b', template: T.office_single },
        { id: 'nh_restroom_3f', template: T.restroom },
      ],
    },
  ],
};

/** Generated interiors for the new districts, keyed by their interior zone id. */
export const DISTRICT_BUILDINGS: Record<string, GeneratedBuilding> = {
  riverside_school: generateBuilding(RIVERSIDE_BUILDING_SPEC),
  northhill_school: generateBuilding(NORTHHILL_BUILDING_SPEC),
};

// --- District registry ------------------------------------------------------

export interface SchoolDistrict {
  /** Outdoor (streamed-town) zone id. */
  id: string;
  name: string;
  fogColor: string;
  ambientLightIntensity: number;
  /** Spawn in the outdoor zone (also the fast-travel arrival point). */
  spawn: { x: number; y: number; z: number };
  /** Interior school zone id reached via the school's front-door portal. */
  buildingZoneId: string;
  /** Exterior facade shown at the outdoor origin. */
  schoolLabel: string;
  shellColor: string;
  roofColor: string;
  exteriorWidth: number;
  exteriorDepth: number;
  exteriorFloors: number;
  /** Bus stop position (world) near the spawn. */
  busStop: [number, number, number];
  /** Extra non-main building facades to render (home district only). */
  extraBuildings: CampusBuildingLayout[];
  /** The home district is unlocked by default. */
  home?: boolean;
}

export const SCHOOL_DISTRICTS: Record<string, SchoolDistrict> = {
  campus_outdoor: {
    id: 'campus_outdoor',
    name: 'Starbridge',
    fogColor: '#cfe0ef',
    ambientLightIntensity: 0.8,
    spawn: { x: 0, y: 0, z: 8 },
    buildingZoneId: 'main_building_1f',
    schoolLabel: 'STARBRIDGE HIGH',
    shellColor: '#d9cbb2',
    roofColor: '#7c5c3b',
    exteriorWidth: 34,
    exteriorDepth: 24,
    exteriorFloors: 3,
    busStop: [16, 0, 12],
    extraBuildings: CAMPUS_BUILDING_LAYOUTS,
    home: true,
  },
  riverside_outdoor: {
    id: 'riverside_outdoor',
    name: 'Riverside',
    fogColor: '#bcd9e6',
    ambientLightIntensity: 0.95,
    spawn: { x: 0, y: 0, z: 8 },
    buildingZoneId: 'riverside_school',
    schoolLabel: 'RIVERSIDE HIGH',
    shellColor: '#aac6d8',
    roofColor: '#3d5a73',
    exteriorWidth: 28,
    exteriorDepth: 20,
    exteriorFloors: 2,
    busStop: [16, 0, 12],
    extraBuildings: [],
  },
  northhill_outdoor: {
    id: 'northhill_outdoor',
    name: 'Northhill',
    fogColor: '#c7cbb8',
    ambientLightIntensity: 0.7,
    spawn: { x: 0, y: 0, z: 8 },
    buildingZoneId: 'northhill_school',
    schoolLabel: 'NORTHHILL SCIENCE',
    shellColor: '#cdd6c2',
    roofColor: '#4f5a3d',
    exteriorWidth: 30,
    exteriorDepth: 22,
    exteriorFloors: 3,
    busStop: [16, 0, 12],
    extraBuildings: [],
  },
};

/** All districts as a list (fast-travel destinations). */
export const FAST_TRAVEL_DESTINATIONS: SchoolDistrict[] = Object.values(SCHOOL_DISTRICTS);

export function getDistrict(zoneId: string): SchoolDistrict | undefined {
  return SCHOOL_DISTRICTS[zoneId];
}

/** True if the zone is a district outdoor (streamed-town) zone. */
export function isDistrictOutdoor(zoneId: string): boolean {
  return zoneId in SCHOOL_DISTRICTS;
}

// --- Outdoor render layout ---------------------------------------------------

export interface OutdoorMainSchool {
  position: [number, number, number];
  label: string;
  shellColor: string;
  roofColor: string;
  width: number;
  depth: number;
  floors: number;
}

export interface OutdoorLayout {
  main: OutdoorMainSchool;
  extras: CampusBuildingLayout[];
  busStop: [number, number, number];
}

/** What to render for a district's outdoor zone: main school + extras + bus stop. */
export function getOutdoorLayoutForZone(zoneId: string): OutdoorLayout | null {
  const d = SCHOOL_DISTRICTS[zoneId];
  if (!d) return null;
  return {
    main: {
      position: [0, 0, 0],
      label: d.schoolLabel,
      shellColor: d.shellColor,
      roofColor: d.roofColor,
      width: d.exteriorWidth,
      depth: d.exteriorDepth,
      floors: d.exteriorFloors,
    },
    extras: d.extraBuildings,
    busStop: d.busStop,
  };
}
