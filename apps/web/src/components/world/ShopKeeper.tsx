// ShopKeeper: a world interactable representing a shop vendor. Walk up and
// press E to open the ShopPanel. Rendered as a market stall / counter with
// the shop's icon floating above it.
import { useCallback, useEffect, useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ShopDefinition } from '@campus-quest/game-data';
import { useInteraction } from '../../hooks/useInteraction';
import { useGameStore } from '../../store/gameStore';
import { useShopStore } from '../../store/shopStore';

interface Props {
  shop: ShopDefinition;
}

export default function ShopKeeper({ shop }: Props) {
  const vecPos = useMemo(() => new THREE.Vector3(...shop.position), [shop.position]);
  const setNearbyInteractable = useGameStore((s) => s.setNearbyInteractable);
  const openShop = useShopStore((s) => s.openShop);
  const activeShop = useShopStore((s) => s.activeShop);

  const inRange = useInteraction({
    targetPosition: vecPos,
    radius: 3.5,
    onEnter: () => setNearbyInteractable(`Browse ${shop.name}`),
    onExit: () => setNearbyInteractable(null),
  });

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'e') return;
      if (!activeShop) openShop(shop.id);
    },
    [openShop, activeShop, shop.id],
  );

  useEffect(() => {
    if (!inRange) return;
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inRange, onKey]);

  return (
    <group position={shop.position}>
      {/* Counter / stall base */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.8, 1.2]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.8} />
      </mesh>

      {/* Counter top */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[2.6, 0.08, 1.4]} />
        <meshStandardMaterial color="#D4A574" roughness={0.6} />
      </mesh>

      {/* Awning posts */}
      {[-1.1, 1.1].map((x) => (
        <mesh key={`post-${x}`} position={[x, 1.6, -0.5]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.6, 8]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>
      ))}

      {/* Awning roof */}
      <mesh position={[0, 2.45, -0.2]} castShadow>
        <boxGeometry args={[2.8, 0.1, 1.6]} />
        <meshStandardMaterial color="#C0392B" roughness={0.7} />
      </mesh>

      {/* Shop icon */}
      <Text
        position={[0, 3.0, 0]}
        fontSize={0.5}
        anchorX="center"
        anchorY="middle"
      >
        {shop.icon}
      </Text>

      {/* Shop name label */}
      <Text
        position={[0, 2.7, 0]}
        fontSize={0.22}
        color={inRange ? '#fbbf24' : 'white'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {shop.name}
      </Text>

      {/* Interaction prompt when in range */}
      {inRange && !activeShop && (
        <Text
          position={[0, 3.4, 0]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
        >
          [E] Browse Shop
        </Text>
      )}
    </group>
  );
}
