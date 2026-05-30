import type { Vector3 } from './common';

export interface PlayerState {
  playerId: string;
  name: string;
  position: Vector3;
  rotation: number;
  inventory: string[];
  currentQuestId?: string;
  lastLogin: string;
  data: string[];
}

export interface PlayerInitRequest {
  playerId: string;
  name?: string;
}

export interface PlayerUpdateRequest {
  position?: Vector3;
  rotation?: number;
}
