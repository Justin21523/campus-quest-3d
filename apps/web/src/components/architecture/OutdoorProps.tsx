// apps/web/src/components/architecture/OutdoorProps.tsx
import { RigidBody } from '@react-three/rapier';
import type { OutdoorPropPlacement } from '../../data/maps/outdoor-templates';

function Tree({ scale = [1, 1, 1] }: { scale?: [number, number, number] }) {
  return (
    <group scale={scale}>
      {/* Trunk */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
          <meshStandardMaterial color="#5c3a1e" />
        </mesh>
      </RigidBody>
      {/* Canopy layers */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[1.2, 8, 8]} />
        <meshStandardMaterial color="#2d6a2e" />
      </mesh>
      <mesh position={[0, 3.2, 0]} castShadow>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color="#3a8a3c" />
      </mesh>
    </group>
  );
}

function Bench({ rotation = 0 }: { rotation?: number }) {
  return (
    <group rotation={[0, rotation, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        {/* Seat */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.08, 0.5]} />
          <meshStandardMaterial color="#8b6914" />
        </mesh>
        {/* Legs */}
        <mesh position={[-0.6, 0.22, 0]} castShadow>
          <boxGeometry args={[0.08, 0.44, 0.4]} />
          <meshStandardMaterial color="#4a3510" />
        </mesh>
        <mesh position={[0.6, 0.22, 0]} castShadow>
          <boxGeometry args={[0.08, 0.44, 0.4]} />
          <meshStandardMaterial color="#4a3510" />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, 0.7, -0.22]} castShadow>
          <boxGeometry args={[1.5, 0.5, 0.06]} />
          <meshStandardMaterial color="#8b6914" />
        </mesh>
      </RigidBody>
    </group>
  );
}

function Lamppost() {
  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.75, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 3.5, 8]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      </RigidBody>
      {/* Light housing */}
      <mesh position={[0, 3.6, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={0.8} />
      </mesh>
      <pointLight position={[0, 3.4, 0]} intensity={0.6} distance={12} color="#fffbe6" />
    </group>
  );
}

function Fountain() {
  return (
    <group>
      {/* Base pool */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2, 2.2, 0.6, 16]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
      </RigidBody>
      {/* Water surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.55, 0]}>
        <circleGeometry args={[1.8, 16]} />
        <meshStandardMaterial color="#60a5fa" transparent opacity={0.7} />
      </mesh>
      {/* Center pillar */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.2, 8]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      {/* Top basin */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.4, 0.2, 12]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
    </group>
  );
}

function Signpost({ rotation = 0 }: { rotation?: number }) {
  return (
    <group rotation={[0, rotation, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.75, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.5, 6]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      </RigidBody>
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.06]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
    </group>
  );
}

function Bush({ scale = [1, 1, 1] }: { scale?: [number, number, number] }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color="#3a7a3c" />
      </mesh>
      <mesh position={[0.3, 0.25, 0.2]} castShadow>
        <sphereGeometry args={[0.35, 8, 6]} />
        <meshStandardMaterial color="#2d6a2e" />
      </mesh>
    </group>
  );
}

const PROP_COMPONENTS: Record<string, React.FC<any>> = {
  tree: Tree,
  bench: Bench,
  lamppost: Lamppost,
  fountain: Fountain,
  signpost: Signpost,
  bush: Bush,
};

export default function OutdoorProp({ type, x, z, rotation = 0, scale }: OutdoorPropPlacement) {
  const Component = PROP_COMPONENTS[type];
  if (!Component) return null;

  return (
    <group position={[x, 0, z]}>
      <Component rotation={rotation} scale={scale} />
    </group>
  );
}
