// packages/game-data/src/maps/room-templates.ts
import type { RoomDefinition } from './types.js';

export const ROOM_TEMPLATES: Record<string, RoomDefinition> = {
  classroom_standard: {
    id: 'classroom_standard',
    type: 'classroom',
    width: 10,
    depth: 8,
    height: 6,
    walls: [
      { x: 0, z: -4, width: 10, rotation: 0 },           // Front wall
      { x: 0, z: 4, width: 10, rotation: Math.PI },       // Back wall (with door)
      { x: -5, z: 0, width: 8, rotation: Math.PI / 2, hasWindow: true, windowHeight: 1.5 }, // Left wall
      { x: 5, z: 0, width: 8, rotation: -Math.PI / 2, hasWindow: true, windowHeight: 1.5 }, // Right wall
    ],
    furniture: [
      // Teacher desk
      { type: 'desk', x: 0, z: -2.5, rotation: 0 },
      // Student desks (3x2 grid)
      { type: 'desk', x: -3, z: 0, rotation: 0 },
      { type: 'desk', x: 0, z: 0, rotation: 0 },
      { type: 'desk', x: 3, z: 0, rotation: 0 },
      { type: 'desk', x: -3, z: 2, rotation: 0 },
      { type: 'desk', x: 0, z: 2, rotation: 0 },
      { type: 'desk', x: 3, z: 2, rotation: 0 },
      // Chairs
      { type: 'chair', x: -3, z: 0.8, rotation: 0 },
      { type: 'chair', x: 0, z: 0.8, rotation: 0 },
      { type: 'chair', x: 3, z: 0.8, rotation: 0 },
      { type: 'chair', x: -3, z: 2.8, rotation: 0 },
      { type: 'chair', x: 0, z: 2.8, rotation: 0 },
      { type: 'chair', x: 3, z: 2.8, rotation: 0 },
      // Blackboard
      { type: 'terminal', x: 0, z: -3.8, rotation: 0, scale: [4, 1.5, 0.1] },
    ],
    floorColor: '#d4c5a9',
    wallColor: '#f5f0e8',
    ceilingColor: '#ffffff',
  },

  corridor_straight: {
    id: 'corridor_straight',
    type: 'corridor',
    width: 4,
    depth: 12,
    height: 6,
    walls: [
      { x: -2, z: 0, width: 12, rotation: Math.PI / 2, hasDoor: true, doorOffset: -3 },
      { x: 2, z: 0, width: 12, rotation: -Math.PI / 2, hasDoor: true, doorOffset: 3 },
    ],
    furniture: [
      { type: 'locker', x: -1.7, z: -4, rotation: Math.PI / 2 },
      { type: 'locker', x: -1.7, z: -2, rotation: Math.PI / 2 },
      { type: 'locker', x: -1.7, z: 0, rotation: Math.PI / 2 },
      { type: 'locker', x: -1.7, z: 2, rotation: Math.PI / 2 },
    ],
    floorColor: '#9ca3af',
    wallColor: '#e5e7eb',
  },

  library_reading: {
    id: 'library_reading',
    type: 'library',
    width: 14,
    depth: 10,
    height: 6.5,
    walls: [
      { x: 0, z: -5, width: 14, rotation: 0 },
      { x: 0, z: 5, width: 14, rotation: Math.PI, hasDoor: true },
      { x: -7, z: 0, width: 10, rotation: Math.PI / 2 },
      { x: 7, z: 0, width: 10, rotation: -Math.PI / 2 },
    ],
    furniture: [
      { type: 'bookshelf', x: -5, z: -3, rotation: 0 },
      { type: 'bookshelf', x: -5, z: 0, rotation: 0 },
      { type: 'bookshelf', x: -5, z: 3, rotation: 0 },
      { type: 'bookshelf', x: 5, z: -3, rotation: Math.PI },
      { type: 'bookshelf', x: 5, z: 0, rotation: Math.PI },
      { type: 'bookshelf', x: 5, z: 3, rotation: Math.PI },
      { type: 'desk', x: -2, z: -1, rotation: 0 },
      { type: 'desk', x: 2, z: -1, rotation: 0 },
      { type: 'desk', x: -2, z: 2, rotation: 0 },
      { type: 'desk', x: 2, z: 2, rotation: 0 },
      { type: 'counter', x: 0, z: -4, rotation: 0, scale: [3, 1.1, 1] },
    ],
    floorColor: '#8b7355',
    wallColor: '#f0ead6',
  },
};
