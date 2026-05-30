// apps/web/src/components/architecture/Furniture.tsx
import { RigidBody } from '@react-three/rapier';
import type { FurniturePlacement } from '@campus-quest/game-data';

const FURNITURE_CONFIG: Record<string, { size: [number, number, number]; color: string; yOffset: number }> = {
  desk: { size: [1.2, 0.75, 0.6], color: '#8b6914', yOffset: 0.375 },
  chair: { size: [0.45, 0.9, 0.45], color: '#4a5568', yOffset: 0.45 },
  bookshelf: { size: [1.5, 2.2, 0.4], color: '#6b4226', yOffset: 1.1 },
  counter: { size: [2, 1.1, 0.8], color: '#718096', yOffset: 0.55 },
  bed: { size: [1, 0.5, 2], color: '#e2e8f0', yOffset: 0.25 },
  locker: { size: [0.5, 1.8, 0.4], color: '#718096', yOffset: 0.9 },
  terminal: { size: [1, 0.8, 0.1], color: '#1a202c', yOffset: 1.2 },
};

export default function Furniture({ type, x, z, rotation, scale }: FurniturePlacement) {
  const config = FURNITURE_CONFIG[type];
  if (!config) return null;

  const sx = scale?.[0] ?? 1;
  const sy = scale?.[1] ?? 1;
  const sz = scale?.[2] ?? 1;

  return (
    <RigidBody type="fixed" colliders="cuboid" position={[x, config.yOffset * sy, z]}>
      <mesh rotation={[0, rotation, 0]} castShadow receiveShadow>
        <boxGeometry args={[config.size[0] * sx, config.size[1] * sy, config.size[2] * sz]} />
        <meshStandardMaterial color={config.color} />
      </mesh>
    </RigidBody>
  );
}
