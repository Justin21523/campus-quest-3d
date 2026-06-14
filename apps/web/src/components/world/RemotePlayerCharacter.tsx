// RemotePlayerCharacter: renders another player's avatar in the 3D world.
// Smoothly interpolates position updates from the server.
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { RemotePlayer } from '../../store/multiplayerStore';

interface Props {
  player: RemotePlayer;
}

const LERP_SPEED = 8;

export default function RemotePlayerCharacter({ player }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useMemo(
    () => new THREE.Vector3(player.position.x, player.position.y, player.position.z),
    [],
  );

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    targetPos.set(player.position.x, player.position.y, player.position.z);
    groupRef.current.position.lerp(targetPos, Math.min(1, LERP_SPEED * delta));
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      player.rotation,
      Math.min(1, LERP_SPEED * delta),
    );
  });

  return (
    <group
      ref={groupRef}
      position={[player.position.x, player.position.y, player.position.z]}
    >
      {/* Player body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
        <meshStandardMaterial color="#60a5fa" />
      </mesh>

      {/* Player name */}
      <Text
        position={[0, 1.7, 0]}
        fontSize={0.25}
        color="#93c5fd"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {player.name}
      </Text>

      {/* Online indicator */}
      <mesh position={[0, 2.0, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
