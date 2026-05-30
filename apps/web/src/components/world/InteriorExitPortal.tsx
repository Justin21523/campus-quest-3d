// apps/web/src/components/world/InteriorExitPortal.tsx
import { useEffect, useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { GeneratedBuilding } from '../../data/maps/floor-generator';
import { useInteraction } from '../../hooks/useInteraction';
import { useGameStore } from '../../store/gameStore';
import { useEnterBuilding } from '../../hooks/useEnterBuilding';

/** Exit marker at a generated interior's entrance — E returns to the town. */
export default function InteriorExitPortal({ building }: { building: GeneratedBuilding }) {
  const setNearby = useGameStore((s) => s.setNearbyInteractable);
  const { exitBuilding } = useEnterBuilding();
  const z = building.footprint.depth / 2 - 1;
  const pos = useMemo(() => new THREE.Vector3(0, 1, z), [z]);

  const inRange = useInteraction({
    targetPosition: pos,
    radius: 2.5,
    onEnter: () => setNearby('Exit to street'),
    onExit: () => setNearby(null),
  });

  useEffect(() => {
    if (!inRange) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') exitBuilding();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inRange, exitBuilding]);

  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 1.4, 0]}>
        <planeGeometry args={[2.4, 2.8]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={inRange ? 0.8 : 0.35} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, 3, 0]} fontSize={0.3} color={inRange ? '#fbbf24' : '#a5b4fc'} anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
        Exit to street
      </Text>
    </group>
  );
}
