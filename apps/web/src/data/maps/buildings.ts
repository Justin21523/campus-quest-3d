// apps/web/src/data/maps/buildings.ts
// BuildingSystem registry: every enterable campus building as its own zone.
// Each spec is run through the data-driven floor generator (floor-generator.ts)
// to produce a fully walkable multi-floor interior. The outdoor layout entries
// describe where each building's exterior + entry portal sit in the campus.
import { generateBuilding, type BuildingSpec, type GeneratedBuilding } from './floor-generator';
import { ROOM_TEMPLATES as T } from './room-templates';
import { FLOOR_HEIGHT } from './constants';

export const LIBRARY_BUILDING_SPEC: BuildingSpec = {
  id: 'library_building',
  zoneId: 'library_building',
  floorHeight: FLOOR_HEIGHT,
  seed: 0x1b7a23,
  corridorWidth: 6,
  shellColor: '#b7a07a',
  roofColor: '#5a4533',
  corridorFloorColor: '#9c8d72',
  corridorWallColor: '#efe7d6',
  floors: [
    {
      level: 0,
      name: '1F — Reading Hall',
      roomSpecs: [
        { id: 'lib_reading_a', template: T.library_reading },
        { id: 'lib_study_a', template: T.study_hall },
        { id: 'lib_office', template: T.office_single },
        { id: 'lib_restroom_1f', template: T.restroom },
      ],
    },
    {
      level: 1,
      name: '2F — Archives',
      roomSpecs: [
        { id: 'lib_archive_a', template: T.archive_room },
        { id: 'lib_archive_b', template: T.archive_room },
        { id: 'lib_study_b', template: T.study_hall },
        { id: 'lib_restroom_2f', template: T.restroom },
      ],
    },
  ],
};

export const ACADEMIC_BUILDING_SPEC: BuildingSpec = {
  id: 'academic_building',
  zoneId: 'academic_building',
  floorHeight: FLOOR_HEIGHT,
  seed: 0x2c93f5,
  corridorWidth: 6,
  shellColor: '#c9d2da',
  roofColor: '#41566a',
  corridorFloorColor: '#9aa6b2',
  corridorWallColor: '#eef2f7',
  floors: [
    {
      level: 0,
      name: '1F — Lecture Halls',
      roomSpecs: [
        { id: 'acad_lecture_a', template: T.lecture_hall },
        { id: 'acad_class_a', template: T.classroom_standard },
        { id: 'acad_class_b', template: T.classroom_standard },
        { id: 'acad_restroom_1f', template: T.restroom },
      ],
    },
    {
      level: 1,
      name: '2F — Laboratories',
      roomSpecs: [
        { id: 'acad_computer_lab', template: T.computer_lab },
        { id: 'acad_science_lab', template: T.science_lab },
        { id: 'acad_lecture_b', template: T.lecture_hall },
        { id: 'acad_restroom_2f', template: T.restroom },
      ],
    },
    {
      level: 2,
      name: '3F — Faculty',
      roomSpecs: [
        { id: 'acad_lounge', template: T.teacher_lounge },
        { id: 'acad_office_a', template: T.office_single },
        { id: 'acad_office_b', template: T.office_single },
        { id: 'acad_restroom_3f', template: T.restroom },
      ],
    },
  ],
};

export const CLUB_BUILDING_SPEC: BuildingSpec = {
  id: 'club_building',
  zoneId: 'club_building',
  floorHeight: FLOOR_HEIGHT,
  seed: 0x3d11a7,
  corridorWidth: 6,
  shellColor: '#d6b8c4',
  roofColor: '#6b3f52',
  corridorFloorColor: '#a98c97',
  corridorWallColor: '#f3e7ec',
  floors: [
    {
      level: 0,
      name: '1F — Club Rooms',
      roomSpecs: [
        { id: 'club_room_a', template: T.club_room },
        { id: 'club_room_b', template: T.club_room },
        { id: 'club_art', template: T.art_room },
        { id: 'club_restroom_1f', template: T.restroom },
      ],
    },
    {
      level: 1,
      name: '2F — Activity Hall',
      roomSpecs: [
        { id: 'club_gym', template: T.gym_hall },
        { id: 'club_lounge', template: T.teacher_lounge },
        { id: 'club_room_c', template: T.club_room },
        { id: 'club_restroom_2f', template: T.restroom },
      ],
    },
  ],
};

/** All generated campus buildings, keyed by their zone id. */
export const CAMPUS_BUILDINGS: Record<string, GeneratedBuilding> = {
  library_building: generateBuilding(LIBRARY_BUILDING_SPEC),
  academic_building: generateBuilding(ACADEMIC_BUILDING_SPEC),
  club_building: generateBuilding(CLUB_BUILDING_SPEC),
};

export function getBuildingByZone(zoneId: string): GeneratedBuilding | undefined {
  return CAMPUS_BUILDINGS[zoneId];
}

/** Outdoor exterior + entry-portal placement for an enterable campus building. */
export interface CampusBuildingLayout {
  zoneId: string;
  label: string;
  /** World position of the exterior's front-door centre in the outdoor campus. */
  exteriorPosition: [number, number, number];
  /** Visual exterior box (independent of the generated interior footprint). */
  width: number;
  depth: number;
  floors: number;
  shellColor: string;
  roofColor: string;
}

export const CAMPUS_BUILDING_LAYOUTS: CampusBuildingLayout[] = [
  {
    zoneId: 'library_building',
    label: 'STARBRIDGE LIBRARY',
    exteriorPosition: [-50, 0, -6],
    width: 24,
    depth: 18,
    floors: 2,
    shellColor: '#b7a07a',
    roofColor: '#5a4533',
  },
  {
    zoneId: 'academic_building',
    label: 'SCIENCE HALL',
    exteriorPosition: [50, 0, -6],
    width: 30,
    depth: 20,
    floors: 3,
    shellColor: '#c9d2da',
    roofColor: '#41566a',
  },
  {
    zoneId: 'club_building',
    label: 'CLUB HOUSE',
    exteriorPosition: [0, 0, -55],
    width: 22,
    depth: 16,
    floors: 2,
    shellColor: '#d6b8c4',
    roofColor: '#6b3f52',
  },
];
