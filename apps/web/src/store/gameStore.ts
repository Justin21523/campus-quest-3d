import { create } from 'zustand';
import type { GeneratedBuilding } from '../data/maps/floor-generator';
import type { MovementMode } from '../world/playerMovement';

interface Vector3 { x: number; y: number; z: number }
export type Vector3Like = Vector3;

interface GameState {
  playerName: string;
  playerId: string;
  health: number;
  stamina: number;
  staminaMax: number;
  isDebugMode: boolean;
  playerPosition: Vector3;
  // Live kinematics published by PlayerController each frame (for HUD/Debug/AI).
  velocity: Vector3;
  grounded: boolean;
  currentFloor: number;
  movementMode: MovementMode;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: number | null;

  // Stamina deltas requested from outside the movement loop (consumables,
  // rewards). PlayerController owns the authoritative stamina ref and applies +
  // clears this each frame.
  pendingStaminaDelta: number;
  addStamina: (amount: number) => void;
  consumePendingStaminaDelta: () => number;

  setPlayerPosition: (pos: Vector3) => void;
  /** Batched per-frame update of player kinematics in a single store write. */
  setPlayerKinematics: (
    p: Partial<
      Pick<GameState, 'playerPosition' | 'velocity' | 'grounded' | 'currentFloor' | 'movementMode' | 'stamina'>
    >,
  ) => void;
  setPlayerId: (id: string) => void;
  setSyncStatus: (status: GameState['syncStatus']) => void;
  toggleDebugMode: () => void;
  takeDamage: (amount: number) => void;

  isInteracting: boolean;
  nearbyInteractable: string | null;
  setInteracting: (v: boolean) => void;
  setNearbyInteractable: (name: string | null) => void;

  // Full-screen map overlay (toggled by the M key / Map button).
  isMapOpen: boolean;
  toggleMap: () => void;
  setMapOpen: (open: boolean) => void;
  
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

export const useGameStore = create<GameState>((set, get) => ({
  playerName: 'Student',
  playerId: '',
  health: 100,
  stamina: 100,
  staminaMax: 100,
  isDebugMode: true,
  playerPosition: { x: 0, y: 0, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  grounded: false,
  currentFloor: 0,
  movementMode: 'walk',
  syncStatus: 'idle',
  lastSyncTime: null,

  pendingStaminaDelta: 0,
  addStamina: (amount) => set((s) => ({ pendingStaminaDelta: s.pendingStaminaDelta + amount })),
  consumePendingStaminaDelta: () => {
    const d = get().pendingStaminaDelta;
    if (d !== 0) set({ pendingStaminaDelta: 0 });
    return d;
  },

  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setPlayerKinematics: (p) => set(p),
  setPlayerId: (id) => set({ playerId: id }),
  setSyncStatus: (status) => set({ syncStatus: status, lastSyncTime: Date.now() }),
  toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),
  takeDamage: (amount) => set((state) => ({ health: Math.max(0, state.health - amount) })),

  isInteracting: false,
  nearbyInteractable: null,
  setInteracting: (v) => set({ isInteracting: v }),
  setNearbyInteractable: (name) => set({ nearbyInteractable: name }),

  isMapOpen: false,
  toggleMap: () => set((state) => ({ isMapOpen: !state.isMapOpen })),
  setMapOpen: (open) => set({ isMapOpen: open }),

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
