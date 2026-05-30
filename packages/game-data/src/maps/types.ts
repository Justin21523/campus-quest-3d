// packages/game-data/src/maps/types.ts
export type RoomType =
  | 'classroom'
  | 'corridor'
  | 'library'
  | 'shop'
  | 'dorm'
  | 'office'
  | 'lobby'
  | 'stairwell';

export interface WallSegment {
  x: number;
  z: number;
  width: number;
  rotation: number; // radians
  hasDoor?: boolean;
  doorOffset?: number; // offset from center
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
}

export interface PlacedRoomDefinition extends RoomDefinition {
  x: number;
  z: number;
}

export interface ZoneDefinition {
  id: string;
  name: string;
  rooms: PlacedRoomDefinition[];
  ambientLightIntensity: number;
  fogColor?: string;
  spawnPoint: { x: number; y: number; z: number };
}
