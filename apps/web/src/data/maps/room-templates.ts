// apps/web/src/data/maps/room-templates.ts
export type RoomType =
  | 'classroom'
  | 'corridor'
  | 'library'
  | 'shop'
  | 'dorm'
  | 'office'
  | 'lobby'
  | 'stairwell'
  | 'lab'
  | 'gym'
  | 'restroom'
  | 'lounge';

export interface WallSegment {
  x: number;
  z: number;
  width: number;
  rotation: number;
  hasDoor?: boolean;
  doorOffset?: number;
  hasWindow?: boolean;
  windowHeight?: number;
}

export interface FurniturePlacement {
  type: 'desk' | 'chair' | 'bookshelf' | 'counter' | 'bed' | 'locker' | 'terminal';
  x: number;
  z: number;
  rotation: number;
  scale?: [number, number, number];
}

export interface RoomDefinition {
  id: string;
  type: RoomType;
  width: number;
  depth: number;
  height: number;
  walls: WallSegment[];
  furniture: FurniturePlacement[];
  floorColor: string;
  wallColor: string;
  ceilingColor?: string;
  baseY?: number;
}

// Uniform interior height so floors stack cleanly inside the building shell.
// FLOOR_HEIGHT (6) - ROOM_HEIGHT (5.2) = 0.8 reserved for the slab between floors.
export const ROOM_HEIGHT = 5.2;

export const ROOM_TEMPLATES: Record<string, RoomDefinition> = {
  classroom_standard: {
    id: 'classroom_standard',
    type: 'classroom',
    width: 10,
    depth: 8,
    height: ROOM_HEIGHT,
    walls: [
      { x: 0, z: -4, width: 10, rotation: 0 },
      { x: 0, z: 4, width: 10, rotation: Math.PI, hasDoor: true },
      { x: -5, z: 0, width: 8, rotation: Math.PI / 2, hasWindow: true, windowHeight: 1.5 },
      { x: 5, z: 0, width: 8, rotation: -Math.PI / 2, hasWindow: true, windowHeight: 1.5 },
    ],
    furniture: [
      { type: 'desk', x: -3, z: 0, rotation: 0 },
      { type: 'desk', x: 0, z: 0, rotation: 0 },
      { type: 'desk', x: 3, z: 0, rotation: 0 },
      { type: 'desk', x: -3, z: 2, rotation: 0 },
      { type: 'desk', x: 0, z: 2, rotation: 0 },
      { type: 'desk', x: 3, z: 2, rotation: 0 },
      { type: 'chair', x: -3, z: 0.8, rotation: 0 },
      { type: 'chair', x: 0, z: 0.8, rotation: 0 },
      { type: 'chair', x: 3, z: 0.8, rotation: 0 },
      { type: 'chair', x: -3, z: 2.8, rotation: 0 },
      { type: 'chair', x: 0, z: 2.8, rotation: 0 },
      { type: 'chair', x: 3, z: 2.8, rotation: 0 },
      { type: 'terminal', x: 0, z: -3.6, rotation: 0, scale: [4, 1.5, 0.1] },
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
    height: ROOM_HEIGHT,
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
    ceilingColor: '#f3f4f6',
  },

  library_reading: {
    id: 'library_reading',
    type: 'library',
    width: 14,
    depth: 10,
    height: ROOM_HEIGHT,
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
    ceilingColor: '#fffaf0',
  },

  lobby_entrance: {
    id: 'lobby_entrance',
    type: 'lobby',
    width: 12,
    depth: 8,
    height: ROOM_HEIGHT,
    walls: [
      // Back wall toward the corridor, with a doorway
      { x: 0, z: -4, width: 12, rotation: 0, hasDoor: true },
      // Front wall faces the main entrance: wide doorway to outside
      { x: 0, z: 4, width: 12, rotation: Math.PI, hasDoor: true },
      { x: -6, z: 0, width: 8, rotation: Math.PI / 2, hasWindow: true, windowHeight: 1.2 },
      { x: 6, z: 0, width: 8, rotation: -Math.PI / 2, hasWindow: true, windowHeight: 1.2 },
    ],
    furniture: [
      { type: 'counter', x: -3, z: -2.5, rotation: 0, scale: [3, 1.1, 1] },
      { type: 'chair', x: 3.5, z: 1.5, rotation: Math.PI },
      { type: 'chair', x: 3.5, z: 2.5, rotation: Math.PI },
      { type: 'bookshelf', x: 5, z: -2.5, rotation: Math.PI / 2 },
    ],
    floorColor: '#cbb994',
    wallColor: '#faf5ec',
    ceilingColor: '#ffffff',
  },

  computer_lab: {
    id: 'computer_lab',
    type: 'lab',
    width: 11,
    depth: 9,
    height: ROOM_HEIGHT,
    walls: [
      { x: 0, z: -4.5, width: 11, rotation: 0 },
      { x: 0, z: 4.5, width: 11, rotation: Math.PI, hasDoor: true },
      { x: -5.5, z: 0, width: 9, rotation: Math.PI / 2, hasWindow: true, windowHeight: 1.4 },
      { x: 5.5, z: 0, width: 9, rotation: -Math.PI / 2, hasWindow: true, windowHeight: 1.4 },
    ],
    furniture: [
      { type: 'desk', x: -3, z: -2.5, rotation: 0, scale: [1.4, 0.75, 0.7] },
      { type: 'desk', x: 0, z: -2.5, rotation: 0, scale: [1.4, 0.75, 0.7] },
      { type: 'desk', x: 3, z: -2.5, rotation: 0, scale: [1.4, 0.75, 0.7] },
      { type: 'desk', x: -3, z: 1, rotation: 0, scale: [1.4, 0.75, 0.7] },
      { type: 'desk', x: 0, z: 1, rotation: 0, scale: [1.4, 0.75, 0.7] },
      { type: 'desk', x: 3, z: 1, rotation: 0, scale: [1.4, 0.75, 0.7] },
      { type: 'terminal', x: -3, z: -2.8, rotation: 0, scale: [1, 0.9, 0.1] },
      { type: 'terminal', x: 0, z: -2.8, rotation: 0, scale: [1, 0.9, 0.1] },
      { type: 'terminal', x: 3, z: -2.8, rotation: 0, scale: [1, 0.9, 0.1] },
      { type: 'terminal', x: -3, z: 0.7, rotation: 0, scale: [1, 0.9, 0.1] },
      { type: 'terminal', x: 0, z: 0.7, rotation: 0, scale: [1, 0.9, 0.1] },
      { type: 'terminal', x: 3, z: 0.7, rotation: 0, scale: [1, 0.9, 0.1] },
      { type: 'chair', x: -3, z: -1.8, rotation: 0 },
      { type: 'chair', x: 0, z: -1.8, rotation: 0 },
      { type: 'chair', x: 3, z: -1.8, rotation: 0 },
      { type: 'chair', x: -3, z: 1.7, rotation: 0 },
      { type: 'chair', x: 0, z: 1.7, rotation: 0 },
      { type: 'chair', x: 3, z: 1.7, rotation: 0 },
    ],
    floorColor: '#94a3b8',
    wallColor: '#eef2f7',
    ceilingColor: '#ffffff',
  },

  science_lab: {
    id: 'science_lab',
    type: 'lab',
    width: 12,
    depth: 9,
    height: ROOM_HEIGHT,
    walls: [
      { x: 0, z: -4.5, width: 12, rotation: 0 },
      { x: 0, z: 4.5, width: 12, rotation: Math.PI, hasDoor: true },
      { x: -6, z: 0, width: 9, rotation: Math.PI / 2, hasWindow: true, windowHeight: 1.5 },
      { x: 6, z: 0, width: 9, rotation: -Math.PI / 2, hasWindow: true, windowHeight: 1.5 },
    ],
    furniture: [
      { type: 'counter', x: -4, z: -2, rotation: 0, scale: [2.5, 0.9, 0.8] },
      { type: 'counter', x: 0, z: -2, rotation: 0, scale: [2.5, 0.9, 0.8] },
      { type: 'counter', x: 4, z: -2, rotation: 0, scale: [2.5, 0.9, 0.8] },
      { type: 'counter', x: -4, z: 1.5, rotation: 0, scale: [2.5, 0.9, 0.8] },
      { type: 'counter', x: 0, z: 1.5, rotation: 0, scale: [2.5, 0.9, 0.8] },
      { type: 'counter', x: 4, z: 1.5, rotation: 0, scale: [2.5, 0.9, 0.8] },
      { type: 'terminal', x: 0, z: -4.3, rotation: 0, scale: [5, 1.5, 0.1] },
      { type: 'bookshelf', x: -5.5, z: 0, rotation: Math.PI / 2 },
    ],
    floorColor: '#e2e8f0',
    wallColor: '#f8fafc',
    ceilingColor: '#ffffff',
  },

  office_single: {
    id: 'office_single',
    type: 'office',
    width: 6,
    depth: 6,
    height: ROOM_HEIGHT,
    walls: [
      { x: 0, z: -3, width: 6, rotation: 0 },
      { x: 0, z: 3, width: 6, rotation: Math.PI, hasDoor: true },
      { x: -3, z: 0, width: 6, rotation: Math.PI / 2 },
      { x: 3, z: 0, width: 6, rotation: -Math.PI / 2, hasWindow: true, windowHeight: 1.2 },
    ],
    furniture: [
      { type: 'desk', x: 0, z: -1.5, rotation: 0, scale: [1.5, 0.75, 0.8] },
      { type: 'chair', x: 0, z: -0.5, rotation: Math.PI },
      { type: 'bookshelf', x: -2.4, z: 0, rotation: Math.PI / 2 },
      { type: 'locker', x: 2.4, z: -2, rotation: 0 },
    ],
    floorColor: '#a0845c',
    wallColor: '#f5f0e8',
    ceilingColor: '#ffffff',
  },

  shop_cafe: {
    id: 'shop_cafe',
    type: 'shop',
    width: 8,
    depth: 7,
    height: ROOM_HEIGHT,
    walls: [
      { x: 0, z: -3.5, width: 8, rotation: 0 },
      { x: 0, z: 3.5, width: 8, rotation: Math.PI, hasDoor: true },
      { x: -4, z: 0, width: 7, rotation: Math.PI / 2, hasWindow: true, windowHeight: 1.0 },
      { x: 4, z: 0, width: 7, rotation: -Math.PI / 2, hasWindow: true, windowHeight: 1.0 },
    ],
    furniture: [
      { type: 'counter', x: 0, z: -2.5, rotation: 0, scale: [4, 1.1, 0.8] },
      { type: 'desk', x: -2.5, z: 1, rotation: 0, scale: [0.8, 0.75, 0.8] },
      { type: 'desk', x: 2.5, z: 1, rotation: 0, scale: [0.8, 0.75, 0.8] },
      { type: 'chair', x: -2.5, z: 1.8, rotation: 0 },
      { type: 'chair', x: 2.5, z: 1.8, rotation: 0 },
      { type: 'bookshelf', x: -3.5, z: -1, rotation: Math.PI / 2, scale: [0.8, 1.8, 0.4] },
    ],
    floorColor: '#c4956a',
    wallColor: '#fef3c7',
    ceilingColor: '#fffbeb',
  },

  dorm_room: {
    id: 'dorm_room',
    type: 'dorm',
    width: 5,
    depth: 6,
    height: ROOM_HEIGHT,
    walls: [
      { x: 0, z: -3, width: 5, rotation: 0 },
      { x: 0, z: 3, width: 5, rotation: Math.PI, hasDoor: true },
      { x: -2.5, z: 0, width: 6, rotation: Math.PI / 2, hasWindow: true, windowHeight: 1.2 },
      { x: 2.5, z: 0, width: 6, rotation: -Math.PI / 2 },
    ],
    furniture: [
      { type: 'bed', x: -1.5, z: -1.5, rotation: 0 },
      { type: 'bed', x: 1.5, z: -1.5, rotation: 0 },
      { type: 'desk', x: -1.5, z: 1.5, rotation: Math.PI },
      { type: 'desk', x: 1.5, z: 1.5, rotation: Math.PI },
      { type: 'chair', x: -1.5, z: 0.8, rotation: Math.PI },
      { type: 'chair', x: 1.5, z: 0.8, rotation: Math.PI },
      { type: 'locker', x: -2.2, z: 0, rotation: Math.PI / 2 },
      { type: 'locker', x: 2.2, z: 0, rotation: -Math.PI / 2 },
    ],
    floorColor: '#b8a080',
    wallColor: '#e8e0d0',
    ceilingColor: '#ffffff',
  },

  // NOTE: walls below are placeholders — the floor generator rebuilds each
  // room's walls with a doorway onto the corridor, so template walls are unused.
  restroom: {
    id: 'restroom',
    type: 'restroom',
    width: 5,
    depth: 6,
    height: ROOM_HEIGHT,
    walls: [],
    furniture: [
      { type: 'counter', x: -1.5, z: -2, rotation: 0, scale: [1.5, 0.9, 0.6] },
      { type: 'counter', x: 1.5, z: -2, rotation: 0, scale: [1.5, 0.9, 0.6] },
      { type: 'locker', x: -2, z: 1.5, rotation: Math.PI / 2, scale: [0.8, 1.6, 0.8] },
      { type: 'locker', x: 2, z: 1.5, rotation: -Math.PI / 2, scale: [0.8, 1.6, 0.8] },
    ],
    floorColor: '#cdd5db',
    wallColor: '#eef3f6',
    ceilingColor: '#ffffff',
  },

  gym_hall: {
    id: 'gym_hall',
    type: 'gym',
    width: 14,
    depth: 11,
    height: ROOM_HEIGHT,
    walls: [],
    furniture: [
      { type: 'locker', x: -6.5, z: -3, rotation: Math.PI / 2 },
      { type: 'locker', x: -6.5, z: -1, rotation: Math.PI / 2 },
      { type: 'locker', x: -6.5, z: 1, rotation: Math.PI / 2 },
      { type: 'locker', x: 6.5, z: -3, rotation: -Math.PI / 2 },
      { type: 'locker', x: 6.5, z: -1, rotation: -Math.PI / 2 },
      { type: 'locker', x: 6.5, z: 1, rotation: -Math.PI / 2 },
      { type: 'counter', x: 0, z: -5, rotation: 0, scale: [3, 0.6, 1] },
    ],
    floorColor: '#caa472',
    wallColor: '#f1ece2',
    ceilingColor: '#ffffff',
  },

  teacher_lounge: {
    id: 'teacher_lounge',
    type: 'lounge',
    width: 8,
    depth: 7,
    height: ROOM_HEIGHT,
    walls: [],
    furniture: [
      { type: 'desk', x: -2, z: -1.5, rotation: 0, scale: [1.4, 0.75, 0.8] },
      { type: 'desk', x: 2, z: -1.5, rotation: 0, scale: [1.4, 0.75, 0.8] },
      { type: 'chair', x: -2, z: -0.6, rotation: Math.PI },
      { type: 'chair', x: 2, z: -0.6, rotation: Math.PI },
      { type: 'counter', x: 0, z: -3, rotation: 0, scale: [3, 1.1, 0.8] },
      { type: 'bookshelf', x: -3.5, z: 1.5, rotation: Math.PI / 2 },
      { type: 'bookshelf', x: 3.5, z: 1.5, rotation: -Math.PI / 2 },
    ],
    floorColor: '#b6a98f',
    wallColor: '#f3eee3',
    ceilingColor: '#ffffff',
  },

  // --- Town interior templates (shops / homes / cafes) ---
  shop_floor: {
    id: 'shop_floor',
    type: 'shop',
    width: 9,
    depth: 8,
    height: ROOM_HEIGHT,
    walls: [],
    furniture: [
      { type: 'bookshelf', x: -3.5, z: -2.5, rotation: 0, scale: [1, 1.6, 0.5] },
      { type: 'bookshelf', x: -3.5, z: 0, rotation: 0, scale: [1, 1.6, 0.5] },
      { type: 'bookshelf', x: 3.5, z: -2.5, rotation: Math.PI, scale: [1, 1.6, 0.5] },
      { type: 'bookshelf', x: 3.5, z: 0, rotation: Math.PI, scale: [1, 1.6, 0.5] },
      { type: 'counter', x: 0, z: 2.5, rotation: 0, scale: [4, 1.1, 0.9] },
      { type: 'terminal', x: 1.5, z: 2.5, rotation: 0, scale: [0.8, 0.7, 0.1] },
    ],
    floorColor: '#d8c7a0',
    wallColor: '#fbf3e2',
    ceilingColor: '#ffffff',
  },

  apartment_living: {
    id: 'apartment_living',
    type: 'lounge',
    width: 7,
    depth: 7,
    height: ROOM_HEIGHT,
    walls: [],
    furniture: [
      { type: 'bed', x: -2, z: -2, rotation: 0, scale: [1.6, 0.5, 1] },
      { type: 'desk', x: 2, z: -2, rotation: 0, scale: [1.2, 0.75, 0.7] },
      { type: 'chair', x: 2, z: -1.1, rotation: Math.PI },
      { type: 'counter', x: -2.5, z: 2, rotation: 0, scale: [2, 1, 0.8] },
      { type: 'bookshelf', x: 2.5, z: 2, rotation: -Math.PI / 2 },
    ],
    floorColor: '#c9b79a',
    wallColor: '#f4ede0',
    ceilingColor: '#ffffff',
  },

  dining_hall: {
    id: 'dining_hall',
    type: 'shop',
    width: 9,
    depth: 8,
    height: ROOM_HEIGHT,
    walls: [],
    furniture: [
      { type: 'counter', x: 0, z: -3, rotation: 0, scale: [4, 1.1, 0.9] },
      { type: 'desk', x: -2.5, z: 0, rotation: 0, scale: [1, 0.75, 1] },
      { type: 'desk', x: 2.5, z: 0, rotation: 0, scale: [1, 0.75, 1] },
      { type: 'desk', x: -2.5, z: 2.5, rotation: 0, scale: [1, 0.75, 1] },
      { type: 'desk', x: 2.5, z: 2.5, rotation: 0, scale: [1, 0.75, 1] },
      { type: 'chair', x: -2.5, z: 0.9, rotation: Math.PI },
      { type: 'chair', x: 2.5, z: 0.9, rotation: Math.PI },
      { type: 'chair', x: -2.5, z: 3.4, rotation: Math.PI },
      { type: 'chair', x: 2.5, z: 3.4, rotation: Math.PI },
    ],
    floorColor: '#c4956a',
    wallColor: '#fef3c7',
    ceilingColor: '#fffbeb',
  },

  // --- Themed campus templates (library / academic / club buildings) ---
  // Walls are left empty: the floor generator rebuilds each room's walls with a
  // doorway onto the corridor, so template walls are ignored for placed rooms.
  study_hall: {
    id: 'study_hall',
    type: 'library',
    width: 12,
    depth: 9,
    height: ROOM_HEIGHT,
    walls: [],
    furniture: [
      { type: 'desk', x: -3, z: -2, rotation: 0, scale: [1.4, 0.75, 0.9] },
      { type: 'desk', x: 0, z: -2, rotation: 0, scale: [1.4, 0.75, 0.9] },
      { type: 'desk', x: 3, z: -2, rotation: 0, scale: [1.4, 0.75, 0.9] },
      { type: 'desk', x: -3, z: 1.5, rotation: 0, scale: [1.4, 0.75, 0.9] },
      { type: 'desk', x: 0, z: 1.5, rotation: 0, scale: [1.4, 0.75, 0.9] },
      { type: 'desk', x: 3, z: 1.5, rotation: 0, scale: [1.4, 0.75, 0.9] },
      { type: 'chair', x: -3, z: -1.1, rotation: Math.PI },
      { type: 'chair', x: 0, z: -1.1, rotation: Math.PI },
      { type: 'chair', x: 3, z: -1.1, rotation: Math.PI },
      { type: 'bookshelf', x: -5, z: 0, rotation: Math.PI / 2 },
      { type: 'bookshelf', x: 5, z: 0, rotation: -Math.PI / 2 },
    ],
    floorColor: '#8b7355',
    wallColor: '#f0ead6',
    ceilingColor: '#fffaf0',
  },

  archive_room: {
    id: 'archive_room',
    type: 'library',
    width: 10,
    depth: 8,
    height: ROOM_HEIGHT,
    walls: [],
    furniture: [
      { type: 'bookshelf', x: -3.5, z: -2.5, rotation: 0 },
      { type: 'bookshelf', x: -3.5, z: 0, rotation: 0 },
      { type: 'bookshelf', x: -3.5, z: 2.5, rotation: 0 },
      { type: 'bookshelf', x: 0, z: -2.5, rotation: 0 },
      { type: 'bookshelf', x: 0, z: 0, rotation: 0 },
      { type: 'bookshelf', x: 0, z: 2.5, rotation: 0 },
      { type: 'bookshelf', x: 3.5, z: -2.5, rotation: Math.PI },
      { type: 'bookshelf', x: 3.5, z: 0, rotation: Math.PI },
      { type: 'counter', x: 0, z: 3.5, rotation: 0, scale: [3, 1.1, 0.8] },
    ],
    floorColor: '#7c6748',
    wallColor: '#ece3cf',
    ceilingColor: '#fffaf0',
  },

  lecture_hall: {
    id: 'lecture_hall',
    type: 'classroom',
    width: 13,
    depth: 10,
    height: ROOM_HEIGHT,
    walls: [],
    furniture: [
      { type: 'terminal', x: 0, z: -4.2, rotation: 0, scale: [6, 1.8, 0.1] },
      { type: 'counter', x: 0, z: -3, rotation: 0, scale: [3, 1.1, 0.8] },
      { type: 'desk', x: -3.5, z: 0, rotation: 0, scale: [3, 0.75, 0.7] },
      { type: 'desk', x: 3.5, z: 0, rotation: 0, scale: [3, 0.75, 0.7] },
      { type: 'desk', x: -3.5, z: 2.5, rotation: 0, scale: [3, 0.75, 0.7] },
      { type: 'desk', x: 3.5, z: 2.5, rotation: 0, scale: [3, 0.75, 0.7] },
      { type: 'chair', x: -3.5, z: 0.9, rotation: Math.PI },
      { type: 'chair', x: 3.5, z: 0.9, rotation: Math.PI },
      { type: 'chair', x: -3.5, z: 3.4, rotation: Math.PI },
      { type: 'chair', x: 3.5, z: 3.4, rotation: Math.PI },
    ],
    floorColor: '#cdbb98',
    wallColor: '#f5f0e8',
    ceilingColor: '#ffffff',
  },

  club_room: {
    id: 'club_room',
    type: 'lounge',
    width: 10,
    depth: 8,
    height: ROOM_HEIGHT,
    walls: [],
    furniture: [
      { type: 'desk', x: -2.5, z: -1.5, rotation: 0, scale: [1.4, 0.75, 0.9] },
      { type: 'desk', x: 2.5, z: -1.5, rotation: 0, scale: [1.4, 0.75, 0.9] },
      { type: 'chair', x: -2.5, z: -0.6, rotation: Math.PI },
      { type: 'chair', x: 2.5, z: -0.6, rotation: Math.PI },
      { type: 'counter', x: 0, z: -3, rotation: 0, scale: [3.5, 1.1, 0.8] },
      { type: 'bookshelf', x: -4, z: 1.5, rotation: Math.PI / 2 },
      { type: 'bookshelf', x: 4, z: 1.5, rotation: -Math.PI / 2 },
      { type: 'locker', x: 0, z: 3, rotation: 0, scale: [2, 1.6, 0.6] },
    ],
    floorColor: '#b59f7d',
    wallColor: '#f1eadb',
    ceilingColor: '#ffffff',
  },

  art_room: {
    id: 'art_room',
    type: 'lounge',
    width: 11,
    depth: 9,
    height: ROOM_HEIGHT,
    walls: [],
    furniture: [
      { type: 'desk', x: -3, z: -2, rotation: 0, scale: [1.2, 0.9, 1.2] },
      { type: 'desk', x: 0, z: -2, rotation: 0, scale: [1.2, 0.9, 1.2] },
      { type: 'desk', x: 3, z: -2, rotation: 0, scale: [1.2, 0.9, 1.2] },
      { type: 'desk', x: -3, z: 1.5, rotation: 0, scale: [1.2, 0.9, 1.2] },
      { type: 'desk', x: 3, z: 1.5, rotation: 0, scale: [1.2, 0.9, 1.2] },
      { type: 'counter', x: 0, z: -3.5, rotation: 0, scale: [3, 1.1, 0.8] },
      { type: 'bookshelf', x: -4.5, z: 1.5, rotation: Math.PI / 2 },
    ],
    floorColor: '#c8b6a0',
    wallColor: '#f6efe6',
    ceilingColor: '#ffffff',
  },
};

// Enlarge every room and spread its furniture proportionally so floors feel
// spacious. Furniture *sizes* stay realistic; only footprints and positions
// scale. Applied once at module load (the generator + archetypes read these).
export const ROOM_SCALE = 1.55;
for (const t of Object.values(ROOM_TEMPLATES)) {
  t.width = Math.round(t.width * ROOM_SCALE * 10) / 10;
  t.depth = Math.round(t.depth * ROOM_SCALE * 10) / 10;
  for (const f of t.furniture) {
    f.x = Math.round(f.x * ROOM_SCALE * 100) / 100;
    f.z = Math.round(f.z * ROOM_SCALE * 100) / 100;
  }
}
