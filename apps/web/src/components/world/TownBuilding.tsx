// apps/web/src/components/world/TownBuilding.tsx
import { useEffect, useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { TownBuildingPlacement } from '../../world/town-generator';
import { ARCHETYPES } from '../../data/maps/building-archetypes';
import { useInteraction } from '../../hooks/useInteraction';
import { useGameStore } from '../../store/gameStore';
import { useEnterBuilding } from '../../hooks/useEnterBuilding';

const FLOOR_H = 6;

/**
 * One enterable town building. The exterior is a solid procedural box (door on
 * +z, window bands, roof, sign); walking to the door + E generates its interior
 * and transitions inside.
 */
export default function TownBuilding({ placement }: { placement: TownBuildingPlacement }) {
  const a = ARCHETYPES[placement.type];
  const H = placement.floors * FLOOR_H;
  const halfW = placement.width / 2;
  const halfD = placement.depth / 2;
  const setNearby = useGameStore((s) => s.setNearbyInteractable);
  const { enterBuilding } = useEnterBuilding();

  const doorPos = useMemo(
    () => new THREE.Vector3(placement.x, 1, placement.z + halfD),
    [placement.x, placement.z, halfD],
  );

  const inRange = useInteraction({
    targetPosition: doorPos,
    radius: 3.5,
    onEnter: () => setNearby(`Enter ${a.label}`),
    onExit: () => setNearby(null),
  });

  useEffect(() => {
    if (!inRange) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') enterBuilding(placement);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inRange, placement, enterBuilding]);

  const windowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#bfe3ff',
        emissive: '#9ec9ff',
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const floorIdx = Array.from({ length: placement.floors }, (_, i) => i);

  return (
    <group position={[placement.x, 0, placement.z]}>
      {/* Solid body */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[placement.width, H, placement.depth]} />
          <meshStandardMaterial color={a.shellColor} roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Roof */}
      <mesh position={[0, H + 0.25, 0]} castShadow>
        <boxGeometry args={[placement.width + 0.8, 0.5, placement.depth + 0.8]} />
        <meshStandardMaterial color={a.roofColor} roughness={0.85} />
      </mesh>

      {/* Door recess on +z face */}
      <mesh position={[0, 1.4, halfD + 0.03]}>
        <boxGeometry args={[2.2, 2.8, 0.1]} />
        <meshStandardMaterial color={inRange ? '#5b4a36' : '#3b2f25'} emissive={inRange ? '#7a5c34' : '#000'} emissiveIntensity={inRange ? 0.4 : 0} />
      </mesh>

      {/* Window bands per floor (front + sides) */}
      {floorIdx.map((i) => (
        <mesh key={`fw-${i}`} position={[0, i * FLOOR_H + 2, halfD + 0.04]} material={windowMat}>
          <boxGeometry args={[placement.width * 0.7, 1.3, 0.05]} />
        </mesh>
      ))}
      {floorIdx.map((i) =>
        [-1, 1].map((s) => (
          <mesh key={`sw-${i}-${s}`} position={[s * (halfW + 0.04), i * FLOOR_H + 2, 0]} material={windowMat}>
            <boxGeometry args={[0.05, 1.3, placement.depth * 0.7]} />
          </mesh>
        )),
      )}

      {/* Sign above the door */}
      <mesh position={[0, 3.4, halfD + 0.06]}>
        <boxGeometry args={[Math.min(placement.width * 0.8, 6), 0.8, 0.08]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <Text position={[0, 3.4, halfD + 0.12]} fontSize={0.5} color="#ffd479" anchorX="center" anchorY="middle" maxWidth={placement.width}>
        {a.label}
      </Text>
    </group>
  );
}
