// apps/web/src/components/architecture/ZonePortal.tsx
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ZoneConnection } from '@campus-quest/game-data';
import { useInteraction } from '../../hooks/useInteraction';
import { useGameStore } from '../../store/gameStore';
import { useZoneTransition } from '../../hooks/useZoneTransition';

interface Props {
  connection: ZoneConnection;
}

export default function ZonePortal({ connection }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const vecPos = useMemo(
    () => new THREE.Vector3(
      connection.portalPosition.x,
      connection.portalPosition.y + connection.portalSize.height / 2,
      connection.portalPosition.z,
    ),
    [connection.portalPosition.x, connection.portalPosition.y, connection.portalPosition.z, connection.portalSize.height],
  );
  const { setNearbyInteractable } = useGameStore();
  const { triggerTransition } = useZoneTransition();

  const inRange = useInteraction({
    targetPosition: vecPos,
    radius: 2,
    onEnter: () => setNearbyInteractable(connection.label || 'Enter'),
    onExit: () => setNearbyInteractable(null),
  });

  // Subtle pulsing animation
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = inRange ? 0.8 : pulse;
    }
  });

  const handleEnter = useCallback(() => {
    triggerTransition(connection);
  }, [connection, triggerTransition]);

  // For now, trigger on E key press when in range
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'e') {
      handleEnter();
    }
  }, [handleEnter]);

  useEffect(() => {
    if (!inRange) return;

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [inRange, onKeyDown]);

  return (
    <group position={[connection.portalPosition.x, 0, connection.portalPosition.z]}
           rotation={[0, connection.portalRotation, 0]}>
      {/* Visual portal indicator */}
      <mesh ref={meshRef} position={[0, connection.portalSize.height / 2, 0]}>
        <planeGeometry args={[connection.portalSize.width, connection.portalSize.height]} />
        <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.3}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label */}
      {connection.label && (
        <Text
          position={[0, connection.portalSize.height + 0.3, 0]}
          fontSize={0.25}
          color={inRange ? '#fbbf24' : '#a5b4fc'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {connection.label}
        </Text>
      )}
    </group>
  );
}
