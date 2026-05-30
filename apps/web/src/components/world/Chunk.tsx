// apps/web/src/components/world/Chunk.tsx
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { generateChunk } from '../../world/town-generator';
import { generateChunkCollectibles } from '../../world/collectibles';
import { useCollectibleStore } from '../../store/collectibleStore';
import OutdoorProp from '../architecture/OutdoorProps';
import TownBuilding from './TownBuilding';
import PickupItem from '../PickupItem';

/** Renders one streamed town chunk: ground collider, streets, props, buildings. */
export default function Chunk({ cx, cz }: { cx: number; cz: number }) {
  const data = useMemo(() => generateChunk(cx, cz), [cx, cz]);
  const collectibles = useMemo(() => generateChunkCollectibles(cx, cz), [cx, cz]);
  const collect = useCollectibleStore((s) => s.collect);
  const collectedIds = useCollectibleStore((s) => s.collectedIds);
  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(0);

  // Brief fade/rise-in so chunks don't pop (scene fog covers the far edge).
  useFrame((_, dt) => {
    if (!groupRef.current || t.current >= 1) return;
    t.current = Math.min(1, t.current + dt / 0.4);
    const e = t.current;
    groupRef.current.position.y = (1 - e) * -2;
  });

  return (
    <group ref={groupRef}>
      {/* Ground tile (with collider so the town is walkable everywhere) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[data.center.x, -0.2, data.center.z]} receiveShadow>
          <boxGeometry args={[data.size, 0.4, data.size]} />
          <meshStandardMaterial color={data.groundColor} roughness={0.95} />
        </mesh>
      </RigidBody>

      {/* Streets */}
      {data.roads.map((r, i) => (
        <mesh key={`road-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[r.x, 0.02, r.z]} receiveShadow>
          <planeGeometry args={[r.width, r.depth]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      ))}

      {/* Parks (slightly brighter grass patch) */}
      {data.parks.map((p, i) => (
        <mesh key={`park-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[p.x, 0.03, p.z]} receiveShadow>
          <planeGeometry args={[p.size, p.size]} />
          <meshStandardMaterial color="#86b25e" />
        </mesh>
      ))}

      {/* Props (trees/benches/lamps/...) */}
      {data.props.map((p, i) => (
        <OutdoorProp key={`prop-${i}`} type={p.type} x={p.x} z={p.z} />
      ))}

      {/* Enterable buildings */}
      {data.buildings.map((b) => (
        <TownBuilding key={b.id} placement={b} />
      ))}

      {/* Hidden collectibles (skip ones already picked up) */}
      {collectibles
        .filter((c) => !collectedIds.includes(c.id))
        .map((c) => (
          <PickupItem
            key={c.id}
            position={[c.x, 0.6, c.z]}
            itemId={c.itemId}
            quantity={1}
            onPickedUp={() => collect(c.id)}
          />
        ))}
    </group>
  );
}
