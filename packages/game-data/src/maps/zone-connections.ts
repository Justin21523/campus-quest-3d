// packages/game-data/src/maps/zone-connections.ts
export interface ZoneConnection {
  id: string;
  fromZone: string;
  toZone: string;
  // Position in the FROM zone where the portal exists
  portalPosition: { x: number; y: number; z: number };
  portalSize: { width: number; height: number };
  portalRotation: number; // Y-axis rotation in radians
  // Spawn point in the TO zone after transition
  spawnPoint: { x: number; y: number; z: number };
  spawnRotation: number; // Facing direction after spawn
  label?: string; // Optional UI label like "To 2F" or "Enter Classroom A"
}

export const ZONE_CONNECTIONS: ZoneConnection[] = [
  // Corridor → Classroom A
  {
    id: 'conn_corridor_to_class_a',
    fromZone: 'main_building_1f',
    toZone: 'classroom_a',
    portalPosition: { x: -4, y: 0, z: -2 },
    portalSize: { width: 1.2, height: 2.4 },
    portalRotation: Math.PI / 2,
    spawnPoint: { x: 0, y: 0, z: 3.5 },
    spawnRotation: Math.PI,
    label: 'Enter Classroom A',
  },
  // Classroom A → Corridor (return)
  {
    id: 'conn_class_a_to_corridor',
    fromZone: 'classroom_a',
    toZone: 'main_building_1f',
    portalPosition: { x: 0, y: 0, z: 4 },
    portalSize: { width: 1.2, height: 2.4 },
    portalRotation: 0,
    spawnPoint: { x: -3, y: 0, z: -2 },
    spawnRotation: -Math.PI / 2,
    label: 'Exit to Corridor',
  },
  // Corridor → Library
  {
    id: 'conn_corridor_to_library',
    fromZone: 'main_building_1f',
    toZone: 'library_main',
    portalPosition: { x: 4, y: 0, z: 0 },
    portalSize: { width: 1.2, height: 2.4 },
    portalRotation: -Math.PI / 2,
    spawnPoint: { x: 0, y: 0, z: 4 },
    spawnRotation: Math.PI,
    label: 'Enter Library',
  },
  // Library → Corridor (return)
  {
    id: 'conn_library_to_corridor',
    fromZone: 'library_main',
    toZone: 'main_building_1f',
    portalPosition: { x: 0, y: 0, z: 5 },
    portalSize: { width: 1.2, height: 2.4 },
    portalRotation: 0,
    spawnPoint: { x: 3, y: 0, z: 0 },
    spawnRotation: Math.PI / 2,
    label: 'Exit to Corridor',
  },
];

export function getConnectionsFromZone(zoneId: string): ZoneConnection[] {
  return ZONE_CONNECTIONS.filter((c) => c.fromZone === zoneId);
}

export function getConnectionById(id: string): ZoneConnection | undefined {
  return ZONE_CONNECTIONS.find((c) => c.id === id);
}
