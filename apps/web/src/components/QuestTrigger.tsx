import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInteraction } from '../hooks/useInteraction';
import { useGameStore } from '../store/gameStore';
import { useQuestStore } from '../store/questStore';

interface Props {
  position: [number, number, number];
  questId: string;
  label: string;
}

export default function QuestTrigger({ position, questId, label }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const vecPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const { setNearbyInteractable } = useGameStore();
  const { openMiniGame, quests } = useQuestStore();

  const quest = quests[questId];
  const isActive = quest?.status === 'active';
  const miniGameId = quest?.miniGameId;

  const inRange = useInteraction({
    targetPosition: vecPos,
    radius: 2.5,
    onEnter: () => {
      if (isActive) setNearbyInteractable(label);
    },
    onExit: () => setNearbyInteractable(null),
  });

  // Rotate animation
  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.15;
    }
  });

  // Handle E key
  const handleInteract = useCallback(() => {
    if (inRange && isActive && miniGameId) {
      openMiniGame(miniGameId);
    }
  }, [inRange, isActive, miniGameId, openMiniGame]);

  const onEKey = useCallback((e: KeyboardEvent) => {
    if (e.key.toLowerCase() === 'e') handleInteract();
  }, [handleInteract]);

  useEffect(() => {
    if (!inRange || !isActive) return;

    window.addEventListener('keydown', onEKey);
    return () => window.removeEventListener('keydown', onEKey);
  }, [inRange, isActive, onEKey]);

  if (!isActive) return null;

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.25]} />
      <meshStandardMaterial
        color={inRange ? '#fbbf24' : '#8b5cf6'}
        emissive={inRange ? '#fbbf24' : '#8b5cf6'}
        emissiveIntensity={inRange ? 0.8 : 0.4}
      />
    </mesh>
  );
}
