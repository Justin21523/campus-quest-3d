import { create } from 'zustand';
import type { GeneratedBuilding } from '../data/maps/floor-generator';

interface Vector3 { x: number; y: number; z: number }
export type Vector3Like = Vector3;

interface GameState {
  playerName: string;
  playerId: string;
  health: number;
  stamina: number;
  isDebugMode: boolean;
  playerPosition: Vector3;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: number | null;

  setPlayerPosition: (pos: Vector3) => void;
  setPlayerId: (id: string) => void;
  setSyncStatus: (status: GameState['syncStatus']) => void;
  toggleDebugMode: () => void;
  takeDamage: (amount: number) => void;

  isInteracting: boolean;
  nearbyInteractable: string | null;
  setInteracting: (v: boolean) => void;
  setNearbyInteractable: (name: string | null) => void;
  
  currentZone: string;
  setCurrentZone: (zoneId: string) => void;

  // On-entry generated town interior (shops/houses). When set and currentZone
  // is 'interior', the generated building is rendered.
  interior: GeneratedBuilding | null;
  interiorReturn: Vector3 | null;
  setInterior: (building: GeneratedBuilding, returnPos: Vector3) => void;
  clearInterior: () => void;

  transitionState: 'idle' | 'fadeOut' | 'fadeIn';
  setTransitionState: (state: 'idle' | 'fadeOut' | 'fadeIn') => void;
  
  playerRotation: number;
  setPlayerRotation: (rotation: number) => void;
  cameraYaw: number;
  setCameraYaw: (yaw: number) => void;

}

export const useGameStore = create<GameState>((set) => ({
  playerName: 'Student',
  playerId: '',
  health: 100,
  stamina: 100,
  isDebugMode: true,
  playerPosition: { x: 0, y: 0, z: 0 },
  syncStatus: 'idle',
  lastSyncTime: null,

  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setPlayerId: (id) => set({ playerId: id }),
  setSyncStatus: (status) => set({ syncStatus: status, lastSyncTime: Date.now() }),
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  takeDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),

  isInteracting: false,
  nearbyInteractable: null,
  setInteracting: (v) => set({ isInteracting: v }),
  setNearbyInteractable: (name) => set({ nearbyInteractable: name }),

  currentZone: 'main_building_1f',
  setCurrentZone: (zoneId) => set({ currentZone: zoneId }),

  interior: null,
  interiorReturn: null,
  setInterior: (building, returnPos) => set({ interior: building, interiorReturn: returnPos }),
  clearInterior: () => set({ interior: null, interiorReturn: null }),

  transitionState: 'idle',
  setTransitionState: (state) => set({ transitionState: state }),
  
  playerRotation: 0,
  setPlayerRotation: (rotation) => set({ playerRotation: rotation }),
  cameraYaw: 0,
  setCameraYaw: (yaw) => set({ cameraYaw: yaw }),

}));
