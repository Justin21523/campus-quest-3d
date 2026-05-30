// packages/game-data/src/maps/campus-zones.ts
import type { PlacedRoomDefinition, RoomDefinition, ZoneDefinition } from './types.js';
import { ROOM_TEMPLATES } from './room-templates.js';

function placeRoom(room: RoomDefinition, id: string, x: number, z: number): PlacedRoomDefinition {
  return { ...room, id, x, z };
}

export const CAMPUS_ZONES: Record<string, ZoneDefinition> = {
  main_building_1f: {
    id: 'main_building_1f',
    name: 'Main Building - 1F',
    ambientLightIntensity: 0.6,
    fogColor: '#e8e0d0',
    spawnPoint: { x: 0, y: 0, z: 0 },
    rooms: [
      // Central corridor
      placeRoom(ROOM_TEMPLATES.corridor_straight, 'corridor_main', 0, 0),
      // Classroom A (left of corridor)
      placeRoom(ROOM_TEMPLATES.classroom_standard, 'room_class_a', -7, -2),
      // Library (right of corridor)
      placeRoom(ROOM_TEMPLATES.library_reading, 'room_library', 9, 0),
    ],
  },
};
