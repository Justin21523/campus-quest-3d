// apps/web/src/data/maps/zone-connections.ts
import { MAIN_BUILDING_ENTRANCE_Z } from './campus-zones';

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

// Floors are now a single continuous walkable building (you climb real stairs),
// so the only zone transition is the front door between the building and the
// outdoor campus.
export const ZONE_CONNECTIONS: ZoneConnection[] = [
  // Building entrance → Outdoor campus (portal sits just inside the front door)
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

  // Outdoor campus → Building entrance (spawn just inside the building front)
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

export function getConnectionsFromZone(zoneId: string): ZoneConnection[] {
  return ZONE_CONNECTIONS.filter((c) => c.fromZone === zoneId);
}
