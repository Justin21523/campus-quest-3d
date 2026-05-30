// apps/web/src/data/maps/zone-connections.ts
import { MAIN_BUILDING_ENTRANCE_Z } from './campus-zones';
import { CAMPUS_BUILDINGS, CAMPUS_BUILDING_LAYOUTS } from './buildings';
import { SCHOOL_DISTRICTS, DISTRICT_BUILDINGS } from './schools';

export interface ZoneConnection {
  id: string;
  fromZone: string;
  toZone: string;
  portalPosition: { x: number; y: number; z: number };
  portalSize: { width: number; height: number };
  portalRotation: number;
  spawnPoint: { x: number; y: number; z: number };
  spawnRotation: number;
  label?: string;
  isStairs?: boolean;
}

// Each building is a single continuous walkable interior (you climb real
// stairs), so the only zone transitions are the front doors between the
// outdoor campus and each building's entrance.
const MAIN_CONNECTIONS: ZoneConnection[] = [
  // Main building entrance → Outdoor campus (portal sits just inside the door)
  {
    id: 'conn_1f_to_outdoor',
    fromZone: 'main_building_1f',
    toZone: 'campus_outdoor',
    portalPosition: { x: 0, y: 0, z: MAIN_BUILDING_ENTRANCE_Z - 1.5 },
    portalSize: { width: 3, height: 2.8 },
    portalRotation: 0,
    spawnPoint: { x: 0, y: 0, z: 8 },
    spawnRotation: 0,
    label: 'Go Outside',
  },

  // Outdoor campus → Main building entrance (spawn just inside the front)
  {
    id: 'conn_outdoor_to_1f',
    fromZone: 'campus_outdoor',
    toZone: 'main_building_1f',
    portalPosition: { x: 0, y: 0, z: 0 },
    portalSize: { width: 3, height: 2.8 },
    portalRotation: Math.PI,
    spawnPoint: { x: 0, y: 0, z: MAIN_BUILDING_ENTRANCE_Z - 3 },
    spawnRotation: Math.PI,
    label: 'Enter Building',
  },
];

// Outdoor ↔ themed building (library / academic / club) portal pairs, derived
// from each building's outdoor layout + generated interior footprint.
const THEMED_CONNECTIONS: ZoneConnection[] = CAMPUS_BUILDING_LAYOUTS.flatMap((layout) => {
  const [ex, , ez] = layout.exteriorPosition;
  const halfDepth = CAMPUS_BUILDINGS[layout.zoneId].footprint.depth / 2;
  const niceName = layout.label
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return [
    // Outdoor → building (portal at the exterior door; spawn just inside)
    {
      id: `conn_outdoor_to_${layout.zoneId}`,
      fromZone: 'campus_outdoor',
      toZone: layout.zoneId,
      portalPosition: { x: ex, y: 0, z: ez },
      portalSize: { width: 3, height: 2.8 },
      portalRotation: Math.PI,
      spawnPoint: { x: 0, y: 0, z: halfDepth - 3 },
      spawnRotation: Math.PI,
      label: `Enter ${niceName}`,
    },
    // Building → outdoor (portal just inside the door; spawn outside, facing out)
    {
      id: `conn_${layout.zoneId}_to_outdoor`,
      fromZone: layout.zoneId,
      toZone: 'campus_outdoor',
      portalPosition: { x: 0, y: 0, z: halfDepth - 1.5 },
      portalSize: { width: 3, height: 2.8 },
      portalRotation: 0,
      spawnPoint: { x: ex, y: 0, z: ez + 6 },
      spawnRotation: 0,
      label: 'Go Outside',
    },
  ];
});

// Each new district's school sits at its outdoor origin (like the main school),
// so its front-door portals mirror the main-building pair, one set per district.
const DISTRICT_CONNECTIONS: ZoneConnection[] = Object.values(SCHOOL_DISTRICTS)
  .filter((d) => !d.home)
  .flatMap((d) => {
    const halfDepth = DISTRICT_BUILDINGS[d.buildingZoneId].footprint.depth / 2;
    return [
      // Outdoor → school (portal at the door; spawn just inside)
      {
        id: `conn_${d.id}_to_${d.buildingZoneId}`,
        fromZone: d.id,
        toZone: d.buildingZoneId,
        portalPosition: { x: 0, y: 0, z: 0 },
        portalSize: { width: 3, height: 2.8 },
        portalRotation: Math.PI,
        spawnPoint: { x: 0, y: 0, z: halfDepth - 3 },
        spawnRotation: Math.PI,
        label: `Enter ${d.name} High`,
      },
      // School → outdoor (portal just inside the door; spawn outside)
      {
        id: `conn_${d.buildingZoneId}_to_${d.id}`,
        fromZone: d.buildingZoneId,
        toZone: d.id,
        portalPosition: { x: 0, y: 0, z: halfDepth - 1.5 },
        portalSize: { width: 3, height: 2.8 },
        portalRotation: 0,
        spawnPoint: d.spawn,
        spawnRotation: 0,
        label: 'Go Outside',
      },
    ];
  });

export const ZONE_CONNECTIONS: ZoneConnection[] = [
  ...MAIN_CONNECTIONS,
  ...THEMED_CONNECTIONS,
  ...DISTRICT_CONNECTIONS,
];

export function getConnectionsFromZone(zoneId: string): ZoneConnection[] {
  return ZONE_CONNECTIONS.filter((c) => c.fromZone === zoneId);
}
