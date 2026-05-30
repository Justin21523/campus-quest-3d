import * as THREE from 'three';
import { useRef, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CapsuleCollider,
  RigidBody,
  useRapier,
  type RapierRigidBody,
} from '@react-three/rapier';
import type { KinematicCharacterController } from '@dimforge/rapier3d-compat';
import { useGameStore } from '../store/gameStore';
import { playerApi } from '../services/api';
import { useThrottle } from '../hooks/useThrottle';
import { useDialogueStore } from '../store/dialogueStore';
import { CAMPUS_ZONES, getFloorFromY } from '../data/maps';
import { findGroundY, SPAWN_PROBE_HEIGHT } from '../world/spawn';
import { resolveMovement, updateStamina, JUMP_SPEED, JUMP_COST, STAMINA_MAX } from '../world/playerMovement';

const SYNC_INTERVAL_MS = 2000;
const FALL_RESET_Y = -12;
const PLAYER_HEIGHT_OFFSET = 1.1; // capsule centre above the floor (feet on baseY)
const GRAVITY = -30;

export default function PlayerController() {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const didSetInitialPosition = useRef(false);
  const verticalVelocity = useRef(0);
  const stamina = useRef(STAMINA_MAX);
  const wasSprinting = useRef(false);
  const jumpQueued = useRef(false);
  // Last position confirmed standing on ground — respawn target after a fall.
  const lastSafePos = useRef<{ x: number; y: number; z: number } | null>(null);
  const controllerRef = useRef<KinematicCharacterController | null>(null);
  const { world, rapier } = useRapier();

  const { playerPosition, playerId, setPlayerPosition, setPlayerKinematics, setPlayerRotation, setSyncStatus } =
    useGameStore();

  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false });

  const syncToServer = useThrottle(
    useCallback(
      async (pos: { x: number; y: number; z: number }) => {
        if (!playerId) return;
        try {
          setSyncStatus('syncing');
          await playerApi.updateState(playerId, { position: pos });
          setSyncStatus('synced');
        } catch {
          setSyncStatus('error');
        }
      },
      [playerId, setSyncStatus],
    ),
    SYNC_INTERVAL_MS,
  );

  // Create the kinematic character controller once.
  useEffect(() => {
    const controller = world.createCharacterController(0.02);
    controller.enableAutostep(0.7, 0.3, true); // climb steps up to 0.7 high
    controller.enableSnapToGround(0.7); // stick to stairs/ground going down
    controller.setMaxSlopeClimbAngle((60 * Math.PI) / 180);
    controller.setMinSlopeSlideAngle((38 * Math.PI) / 180);
    controller.setApplyImpulsesToDynamicBodies(true);
    controller.setSlideEnabled(true);
    controllerRef.current = controller;
    return () => {
      world.removeCharacterController(controller);
      controllerRef.current = null;
    };
  }, [world]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'shift') keys.current.shift = true;
      else if (key in keys.current) keys.current[key as 'w' | 'a' | 's' | 'd'] = true;
      // Jump is edge-triggered: queue once per press, ignore auto-repeat.
      if ((key === ' ' || e.code === 'Space') && !e.repeat) jumpQueued.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'shift') keys.current.shift = false;
      else if (key in keys.current) keys.current[key as 'w' | 'a' | 's' | 'd'] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Seat the player's feet on the real floor under (x, z); fall back to targetY.
  const groundedSpawnY = useCallback(
    (x: number, z: number, targetY: number) => {
      const collider = rigidBodyRef.current?.collider(0) ?? null;
      const surfaceY = findGroundY(rapier, world, x, z, targetY + SPAWN_PROBE_HEIGHT, collider);
      return (surfaceY ?? targetY) + PLAYER_HEIGHT_OFFSET;
    },
    [rapier, world],
  );

  // Initial placement + external teleports (zone transitions) jump the body.
  useEffect(() => {
    const rb = rigidBodyRef.current;
    if (!rb || !playerPosition) return;

    if (!didSetInitialPosition.current) {
      const y = groundedSpawnY(playerPosition.x, playerPosition.z, Math.max(playerPosition.y, 0));
      rb.setTranslation({ x: playerPosition.x, y, z: playerPosition.z }, true);
      didSetInitialPosition.current = true;
      verticalVelocity.current = 0;
      lastSafePos.current = { x: playerPosition.x, y: y - PLAYER_HEIGHT_OFFSET, z: playerPosition.z };
      return;
    }

    const cur = rb.translation();
    const dx = playerPosition.x - cur.x;
    const dy = playerPosition.y + PLAYER_HEIGHT_OFFSET - cur.y;
    const dz = playerPosition.z - cur.z;
    if (dx * dx + dy * dy + dz * dz > 9) {
      const y = groundedSpawnY(playerPosition.x, playerPosition.z, playerPosition.y);
      rb.setTranslation({ x: playerPosition.x, y, z: playerPosition.z }, true);
      verticalVelocity.current = 0;
      lastSafePos.current = { x: playerPosition.x, y: y - PLAYER_HEIGHT_OFFSET, z: playerPosition.z };
    }
  }, [playerPosition, groundedSpawnY]);

  useFrame((_, delta) => {
    const rb = rigidBodyRef.current;
    const controller = controllerRef.current;
    if (!rb || !controller) return;
    const collider = rb.collider(0);
    if (!collider) return;

    const dt = Math.min(delta, 0.05); // clamp to avoid tunnelling on hitches
    const pos = rb.translation();

    // Fall recovery: return to the last safe spot, else the zone spawn point.
    if (pos.y < FALL_RESET_Y) {
      const { currentZone } = useGameStore.getState();
      const spawn =
        lastSafePos.current ?? CAMPUS_ZONES[currentZone]?.spawnPoint ?? CAMPUS_ZONES.main_building_1f.spawnPoint;
      rb.setTranslation({ x: spawn.x, y: spawn.y + PLAYER_HEIGHT_OFFSET, z: spawn.z }, true);
      verticalVelocity.current = 0;
      setPlayerPosition({ x: spawn.x, y: spawn.y, z: spawn.z });
      return;
    }

    const { isInteracting, transitionState, cameraYaw } = useGameStore.getState();
    const { isOpen } = useDialogueStore.getState();
    const locked = isInteracting || isOpen || transitionState !== 'idle';

    // Horizontal movement, relative to the camera.
    let inputX = 0;
    let inputZ = 0;
    if (!locked) {
      if (keys.current.w) inputZ -= 1;
      if (keys.current.s) inputZ += 1;
      if (keys.current.a) inputX -= 1;
      if (keys.current.d) inputX += 1;
    }
    const moving = inputX !== 0 || inputZ !== 0;

    // Resolve walk/run/sprint tier and update stamina.
    const { mode, speed } = resolveMovement({
      moving,
      shift: keys.current.shift && !locked,
      stamina: stamina.current,
      wasSprinting: wasSprinting.current,
    });
    stamina.current = updateStamina(stamina.current, mode, dt);
    // Apply external stamina deltas (consumables / rewards) into the ref.
    const staminaDelta = useGameStore.getState().consumePendingStaminaDelta();
    if (staminaDelta !== 0) {
      stamina.current = Math.max(0, Math.min(STAMINA_MAX, stamina.current + staminaDelta));
    }
    wasSprinting.current = mode === 'sprint';

    const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));
    const move = forward.multiplyScalar(-inputZ).add(right.multiplyScalar(inputX));
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed);
      setPlayerRotation(Math.atan2(move.x, move.z));
    }

    // Jump: edge-triggered, only when grounded and with enough stamina.
    const groundedNow = controller.computedGrounded();
    if (jumpQueued.current && !locked && groundedNow && stamina.current >= JUMP_COST) {
      verticalVelocity.current = JUMP_SPEED;
      stamina.current = Math.max(0, stamina.current - JUMP_COST);
    }
    jumpQueued.current = false;

    // Gravity (integrated; reset when grounded).
    verticalVelocity.current += GRAVITY * dt;

    const desired = { x: move.x * dt, y: verticalVelocity.current * dt, z: move.z * dt };
    controller.computeColliderMovement(collider, desired);
    const corrected = controller.computedMovement();

    const grounded = controller.computedGrounded();
    if (grounded && verticalVelocity.current < 0) {
      verticalVelocity.current = 0;
    }

    const next = { x: pos.x + corrected.x, y: pos.y + corrected.y, z: pos.z + corrected.z };
    rb.setNextKinematicTranslation(next);

    // Store the floor-level (feet) position so spawnPoints/camera stay consistent.
    const storePos = { x: next.x, y: next.y - PLAYER_HEIGHT_OFFSET, z: next.z };

    // Remember the spot whenever standing on the ground (not mid-jump).
    if (grounded && verticalVelocity.current <= 0) {
      lastSafePos.current = storePos;
    }

    // One batched store write per frame for all live kinematics.
    setPlayerKinematics({
      playerPosition: storePos,
      velocity: { x: move.x, y: verticalVelocity.current, z: move.z },
      grounded,
      currentFloor: getFloorFromY(storePos.y),
      movementMode: mode,
      stamina: Math.round(stamina.current),
    });
    syncToServer(storePos);
  });

  return (
    <RigidBody ref={rigidBodyRef} type="kinematicPosition" colliders={false}>
      <CapsuleCollider args={[0.5, 0.5]} />
      <mesh castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
    </RigidBody>
  );
}
