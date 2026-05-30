// apps/web/src/components/Scene3D.tsx
import { Canvas, useFrame } from '@react-three/fiber';
import { Stats, Sky } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { getNpcsAt } from '@campus-quest/game-data';
import PlayerController from './PlayerController';
import FollowCamera from './FollowCamera';
import { useGameStore } from '../store/gameStore';
import { useClockStore } from '../store/clockStore';
import NpcCharacter from './world/NpcCharacter';
import QuestTrigger from './QuestTrigger';
import PickupItem from './PickupItem';
import CampusMap from './architecture/CampusMap';
import EventMarker from './world/EventMarker';
import { useEventStore } from '../store/eventStore';

/** Renders the live random events located in the current zone. */
function EventMarkers() {
  const currentZone = useGameStore((s) => s.currentZone);
  const activeEvents = useEventStore((s) => s.activeEvents);
  return (
    <>
      {activeEvents
        .filter((e) => e.zone === currentZone)
        .map((e) => (
          <EventMarker key={e.id} event={e} />
        ))}
    </>
  );
}

/** Renders the NPCs scheduled into the current zone at the current day-phase. */
function NpcSpawner() {
  const currentZone = useGameStore((s) => s.currentZone);
  const phase = useClockStore((s) => s.phase);
  const npcs = getNpcsAt(currentZone, phase);
  return (
    <>
      {npcs.map((npc) => (
        <NpcCharacter key={npc.id} npc={npc} position={npc.schedule[phase].position} />
      ))}
    </>
  );
}

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

      {/* Non-physics entities — NPCs scheduled into the current zone/phase */}
      <NpcSpawner />
      <EventMarkers />
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
