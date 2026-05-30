// apps/web/src/components/world/Vehicle.tsx
// An ambient vehicle (car / school bus / bike) looping along one road lane.
// It advances only while its axis light is green (isAxisGreen) so it visibly
// stops at reds, loops at the chunk span, and faces its travel direction.
// Built from boxes — no physics, never collides with the player.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHUNK_SIZE } from '../../world/chunks';
import { isAxisGreen } from '../../world/trafficSignal';
import type { VehicleSpec } from '../../world/traffic';

function CarBody({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.6, 0.7, 3.2]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.95, -0.2]} castShadow>
        <boxGeometry args={[1.4, 0.6, 1.6]} />
        <meshStandardMaterial color="#cfe8f5" roughness={0.2} metalness={0.1} />
      </mesh>
    </group>
  );
}

function BusBody({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[2.2, 2.0, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Window band */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2.22, 0.6, 5]} />
        <meshStandardMaterial color="#2b3a45" roughness={0.2} />
      </mesh>
    </group>
  );
}

function BikeBody({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.4, 0.5, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Rider */}
      <mesh position={[0, 1.1, -0.1]} castShadow>
        <capsuleGeometry args={[0.22, 0.5, 4, 8]} />
        <meshStandardMaterial color="#3a3f44" roughness={0.8} />
      </mesh>
    </group>
  );
}

const BODY = {
  car: CarBody,
  bus: BusBody,
  bike: BikeBody,
};

export default function Vehicle({
  spec,
  originX,
  originZ,
}: {
  spec: VehicleSpec;
  originX: number;
  originZ: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const dist = useRef(spec.phase);

  useFrame((state, dt) => {
    if (!ref.current) return;
    if (isAxisGreen(state.clock.elapsedTime, spec.axis)) {
      dist.current = (dist.current + dt * spec.speed) % CHUNK_SIZE;
    }
    const d = dist.current;
    const along = spec.dir > 0 ? d : CHUNK_SIZE - d;

    if (spec.axis === 'x') {
      ref.current.position.set(originX + along, 0, originZ + spec.lane);
      ref.current.rotation.y = spec.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      ref.current.position.set(originX + spec.lane, 0, originZ + along);
      ref.current.rotation.y = spec.dir > 0 ? 0 : Math.PI;
    }
  });

  const Body = BODY[spec.kind];
  return (
    <group ref={ref}>
      <Body color={spec.color} />
    </group>
  );
}
