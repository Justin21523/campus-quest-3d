// apps/web/src/components/world/EventMarker.tsx
// A glowing beacon marking a live random event. Walk into range and press E to
// resolve it: the reward (items / stamina / friendship) is granted and the event
// clears. The resolve toast is driven by eventStore.lastResolved.
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useInteraction } from '../../hooks/useInteraction';
import { useGameStore } from '../../store/gameStore';
import { useEventStore, type ActiveEvent } from '../../store/eventStore';
import { getEventDefById } from '../../data/events';
import { grantReward } from '../../world/reward';

export default function EventMarker({ event }: { event: ActiveEvent }) {
  const def = getEventDefById(event.defId);
  const vecPos = useMemo(() => new THREE.Vector3(event.x, 0, event.z), [event.x, event.z]);
  const setNearbyInteractable = useGameStore((s) => s.setNearbyInteractable);
  const resolve = useEventStore((s) => s.resolve);
  const meshRef = useRef<THREE.Mesh>(null);

  const inRange = useInteraction({
    targetPosition: vecPos,
    radius: 2.5,
    onEnter: () => setNearbyInteractable(def ? `Help: ${def.title}` : 'Investigate'),
    onExit: () => setNearbyInteractable(null),
  });

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'e' || !def) return;
      grantReward(def.reward);
      setNearbyInteractable(null);
      resolve(event.id);
    },
    [def, event.id, resolve, setNearbyInteractable],
  );

  useEffect(() => {
    if (!inRange) return;
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inRange, onKey]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 1.5;
    meshRef.current.position.y = 1.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
  });

  if (!def) return null;

  return (
    <group position={[event.x, 0, event.z]}>
      {/* Light pillar */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 4, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.2} transparent opacity={0.4} />
      </mesh>
      {/* Floating beacon */}
      <mesh ref={meshRef} position={[0, 1.4, 0]} castShadow>
        <octahedronGeometry args={[0.35]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={inRange ? 1.6 : 0.8} />
      </mesh>
      <Text position={[0, 3.2, 0]} fontSize={0.32} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000">
        {inRange ? `[E] ${def.title}` : '!'}
      </Text>
    </group>
  );
}
