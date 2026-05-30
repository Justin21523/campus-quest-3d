// apps/web/src/components/PickupItem.tsx
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useInteraction } from '../hooks/useInteraction';
import { useGameStore } from '../store/gameStore';
import { useInventoryStore } from '../store/inventoryStore';
import { getItemById } from '@campus-quest/game-data';

interface Props {
  position: [number, number, number];
  itemId: string;
  quantity?: number;
  onPickedUp?: () => void;
}

export default function PickupItem({ position, itemId, quantity = 1, onPickedUp }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const vecPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const { setNearbyInteractable } = useGameStore();
  const { addItem } = useInventoryStore();
  const itemDef = getItemById(itemId);

  const inRange = useInteraction({
    targetPosition: vecPos,
    radius: 2,
    onEnter: () => setNearbyInteractable(`Pick up ${itemDef?.name || itemId}`),
    onExit: () => setNearbyInteractable(null),
  });

  // Floating + rotation animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 1.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  const onEKey = useCallback((e: KeyboardEvent) => {
    if (e.key.toLowerCase() !== 'e') return;
    const success = addItem(itemId, quantity);
    if (success) {
      onPickedUp?.();
      // Note: Parent should handle removal from scene via state
    } else {
      console.warn('Inventory full.');
    }
  }, [addItem, itemId, onPickedUp, quantity]);

  useEffect(() => {
    if (!inRange) return;

    window.addEventListener('keydown', onEKey);
    return () => window.removeEventListener('keydown', onEKey);
  }, [inRange, onEKey]);

  if (!itemDef) return null;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[0.2]} />
        <meshStandardMaterial
          color={inRange ? '#fbbf24' : '#8b5cf6'}
          emissive={inRange ? '#fbbf24' : '#8b5cf6'}
          emissiveIntensity={inRange ? 0.8 : 0.3}
        />
      </mesh>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000000"
      >
        {itemDef.icon} {itemDef.name}
      </Text>
    </group>
  );
}
