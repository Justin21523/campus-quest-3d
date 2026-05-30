// apps/web/src/components/world/BusStop.tsx
// A roadside bus shelter + sign. Walk up and press E to open the fast-travel
// menu (district selection). Built from boxes; the shelter posts have colliders
// so the player can't walk through them.
import { useCallback, useEffect, useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useInteraction } from '../../hooks/useInteraction';
import { useGameStore } from '../../store/gameStore';
import { useTravelStore } from '../../store/travelStore';

interface Props {
  position?: [number, number, number];
}

export default function BusStop({ position = [0, 0, 0] }: Props) {
  const vecPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const setNearbyInteractable = useGameStore((s) => s.setNearbyInteractable);
  const openFastTravel = useTravelStore((s) => s.openFastTravel);
  const isFastTravelOpen = useTravelStore((s) => s.isFastTravelOpen);

  const inRange = useInteraction({
    targetPosition: vecPos,
    radius: 3,
    onEnter: () => setNearbyInteractable('Take the bus (Fast Travel)'),
    onExit: () => setNearbyInteractable(null),
  });

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'e') return;
      if (!isFastTravelOpen) openFastTravel();
    },
    [openFastTravel, isFastTravelOpen],
  );

  useEffect(() => {
    if (!inRange) return;
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inRange, onKey]);

  return (
    <group position={position}>
      {/* Platform */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[4, 0.1, 2.4]} />
        <meshStandardMaterial color="#9aa0a6" roughness={0.9} />
      </mesh>

      {/* Shelter posts (with colliders) */}
      {[-1.7, 1.7].map((x) => (
        <RigidBody key={`post-${x}`} type="fixed" colliders="cuboid">
          <mesh position={[x, 1.2, -0.9]} castShadow>
            <boxGeometry args={[0.12, 2.4, 0.12]} />
            <meshStandardMaterial color="#3b4148" />
          </mesh>
        </RigidBody>
      ))}

      {/* Shelter roof */}
      <mesh position={[0, 2.5, -0.6]} castShadow>
        <boxGeometry args={[4, 0.15, 1.8]} />
        <meshStandardMaterial color="#2b6cb0" roughness={0.6} />
      </mesh>

      {/* Sign pole + board */}
      <mesh position={[2.3, 1.3, 0.8]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 2.6, 8]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      <mesh position={[2.3, 2.5, 0.8]} castShadow>
        <boxGeometry args={[1.2, 0.7, 0.08]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      <Text position={[2.3, 2.5, 0.85]} fontSize={0.22} color="#ffd479" anchorX="center" anchorY="middle">
        BUS
      </Text>

      {/* Prompt hint when in range */}
      {inRange && !isFastTravelOpen && (
        <Text position={[0, 3.1, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
          [E] Fast Travel
        </Text>
      )}
    </group>
  );
}
