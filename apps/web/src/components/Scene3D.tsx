// apps/web/src/components/Scene3D.tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Stats } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import PlayerController from './PlayerController';
import FollowCamera from './FollowCamera';
import { useInteraction } from '../hooks/useInteraction';
import { useDialogueStore, type DialogueLine } from '../store/dialogueStore';
import { useGameStore } from '../store/gameStore';
import QuestTrigger from './QuestTrigger';
import PickupItem from './PickupItem';
import CampusMap from './architecture/CampusMap';
import { Sky } from '@react-three/drei';

// NPC dialogue data (will move to game-data package later)
const NPC_DIALOGUES: Record<string, DialogueLine[]> = {
  'Librarian Alice': [
    { speaker: 'Alice', text: "Welcome to the Starbridge Library! Have you noticed anything... strange lately?" },
    { speaker: 'Alice', text: "Some books have been disappearing from the restricted section. The system shows they were never checked out." },
    { speaker: 'Alice', text: "If you're looking for clues about the missing semester, start by restoring the catalog marker nearby.", questId: 'q_library_sort' },
  ],
  'Club President Bob': [
    { speaker: 'Bob', text: "Hey! You must be the new transfer student. Perfect timing!" },
    { speaker: 'Bob', text: "Our club room's electronic lock has been glitching since last week. I think someone tampered with the access logs." },
    { speaker: 'Bob', text: "Can you help me investigate? There might be a mini-game puzzle to bypass the corrupted security system." },
  ],
};

function WorldGround() {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[160, 0.12, 160]} position={[0, -0.12, 0]} />
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <boxGeometry args={[320, 0.08, 320]} />
        <meshStandardMaterial color="#5f7f52" roughness={0.9} />
      </mesh>
    </RigidBody>
  );
}

// NPC Component (Static placeholder)
function NPC({ position, name }: { position: [number, number, number]; name: string }) {
  const vecPos = new THREE.Vector3(...position);
  const openDialogue = useDialogueStore((s) => s.openDialogue);
  const { setNearbyInteractable, setInteracting } = useGameStore();

  const inRange = useInteraction({
    targetPosition: vecPos,
    radius: 3,
    onEnter: () => setNearbyInteractable(`Talk to ${name}`),
    onExit: () => setNearbyInteractable(null),
  });

  // Handle E key press
  useEffect(() => {
    if (!inRange) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') {
        const dialogues = NPC_DIALOGUES[name];
        if (dialogues) {
          setInteracting(true);
          openDialogue(name, dialogues);
        }
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [inRange, name, openDialogue, setInteracting]);

  // Reset interaction lock when dialogue closes
  const isOpen = useDialogueStore((s) => s.isOpen);
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
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color={inRange ? '#fbbf24' : 'white'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {name}
      </Text>
    </group>
  );
}

// Interaction Marker
function InteractionMarker({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.2]} />
      <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
    </mesh>
  );
}

export default function Scene3D() {
  const [pickedUpItems, setPickedUpItems] = useState<Set<string>>(new Set());

  const handlePickup = (id: string) => {
    setPickedUpItems((prev) => new Set(prev).add(id));
  };

  return (
    <Canvas shadows={{ type: THREE.PCFShadowMap }} className="absolute inset-0">
      {/* Solid blue background as a guaranteed fallback behind the sky dome */}
      <color attach="background" args={['#87ceeb']} />
      {/* Distance haze so streamed town chunks fade in/out at the load radius */}
      <fog attach="fog" args={['#bcdcf0', 60, 150]} />
      {/* Blue sky - distance kept within the camera far plane (3000) so it isn't culled */}
      <Sky distance={1500} sunPosition={[100, 50, 100]} turbidity={0.3} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
      {/* Lighting */}

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Physics World */}
      <Physics gravity={[0, -9.81, 0]}>
        <WorldGround />
        <CampusMap />
        {/* PlayerController now handles both physics AND visual mesh */}
        <PlayerController />
      </Physics>

      {/* Non-physics entities */}
      <NPC position={[-3, 0, -2]} name="Librarian Alice" />
      <NPC position={[4, 0, 1]} name="Club President Bob" />
      <InteractionMarker position={[0, 1.5, -3]} />
      {/* Quest Triggers */}
      <QuestTrigger
        position={[0, 1.5, -3]}
        questId="q_library_sort"
        label="Start Sorting"
       />
        {/* World Pickups */}
        {!pickedUpItems.has('pickup_data_1') && (
          <PickupItem
            position={[6, 0.5, 3]}
            itemId="data_fragment"
            quantity={1}
            onPickedUp={() => handlePickup('pickup_data_1')}
          />
        )}
        {!pickedUpItems.has('pickup_drink_1') && (
          <PickupItem
            position={[-5, 0.5, -4]}
            itemId="energy_drink"
            quantity={2}
            onPickedUp={() => handlePickup('pickup_drink_1')}
          />
        )}
      {/* Camera & Debug */}
      <FollowCamera smoothness={10} />
      <Stats />
    </Canvas>
  );
}
