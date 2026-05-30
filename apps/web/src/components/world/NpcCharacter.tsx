// apps/web/src/components/world/NpcCharacter.tsx
// Data-driven NPC: positioned by its day-phase schedule, opens its dialogue on
// E, and earns a small friendship bump the first time you talk each phase.
import { useEffect, useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { NpcDefinition } from '@campus-quest/game-data';
import { useInteraction } from '../../hooks/useInteraction';
import { useDialogueStore } from '../../store/dialogueStore';
import { useGameStore } from '../../store/gameStore';
import { useClockStore } from '../../store/clockStore';
import { useFriendshipStore, friendshipLevel } from '../../store/friendshipStore';

interface Props {
  npc: NpcDefinition;
  position: [number, number, number];
}

export default function NpcCharacter({ npc, position }: Props) {
  const vecPos = useMemo(() => new THREE.Vector3(...position), [position]);
  const openDialogue = useDialogueStore((s) => s.openDialogue);
  const isOpen = useDialogueStore((s) => s.isOpen);
  const { setNearbyInteractable, setInteracting } = useGameStore();
  const phase = useClockStore((s) => s.phase);
  const greet = useFriendshipStore((s) => s.greet);
  const points = useFriendshipStore((s) => s.points[npc.id] ?? 0);
  const level = friendshipLevel(points);

  const inRange = useInteraction({
    targetPosition: vecPos,
    radius: 3,
    onEnter: () => setNearbyInteractable(`Talk to ${npc.name}`),
    onExit: () => setNearbyInteractable(null),
  });

  useEffect(() => {
    if (!inRange) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') {
        setInteracting(true);
        openDialogue(npc.name, npc.dialogue);
        greet(npc.id, phase);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [inRange, npc, openDialogue, setInteracting, greet, phase]);

  // Release the interaction lock when the dialogue closes.
  useEffect(() => {
    if (!isOpen) setInteracting(false);
  }, [isOpen, setInteracting]);

  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
        <meshStandardMaterial color={inRange ? '#34d399' : '#10b981'} />
      </mesh>
      <Text
        position={[0, 1.7, 0]}
        fontSize={0.3}
        color={inRange ? '#fbbf24' : 'white'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {npc.name}
      </Text>
      <Text position={[0, 1.4, 0]} fontSize={0.18} color="#a7f3d0" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000000">
        {level}
      </Text>
    </group>
  );
}
