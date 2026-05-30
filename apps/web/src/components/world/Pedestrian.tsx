// apps/web/src/components/world/Pedestrian.tsx
// A small capsule pedestrian strolling a sidewalk lane, looping at the chunk
// span with a gentle walking bob. Ambient only — no physics.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHUNK_SIZE } from '../../world/chunks';
import type { PedestrianSpec } from '../../world/traffic';

export default function Pedestrian({
  spec,
  originX,
  originZ,
}: {
  spec: PedestrianSpec;
  originX: number;
  originZ: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const dist = useRef(spec.phase);

  useFrame((state, dt) => {
    if (!ref.current) return;
    dist.current = (dist.current + dt * spec.speed) % CHUNK_SIZE;
    const d = dist.current;
    const along = spec.dir > 0 ? d : CHUNK_SIZE - d;
    const bob = Math.abs(Math.sin(state.clock.elapsedTime * 5)) * 0.08;

    if (spec.axis === 'x') {
      ref.current.position.set(originX + along, bob, originZ + spec.lane);
      ref.current.rotation.y = spec.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      ref.current.position.set(originX + spec.lane, bob, originZ + along);
      ref.current.rotation.y = spec.dir > 0 ? 0 : Math.PI;
    }
  });

  return (
    <group ref={ref}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.7, 4, 8]} />
        <meshStandardMaterial color={spec.color} roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#e7c6a5" roughness={0.8} />
      </mesh>
    </group>
  );
}
