// apps/web/src/components/architecture/FloorSlab.tsx
import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';

export interface SlabOpening {
  x: number;
  z: number;
  width: number;
  depth: number;
}

interface Props {
  width: number;
  depth: number;
  /** World Y of the walking surface (top of the slab). */
  baseY: number;
  color: string;
  thickness?: number;
  /** Optional rectangular hole (e.g. the stairwell) cut from the slab. */
  opening?: SlabOpening;
}

interface Piece {
  w: number;
  d: number;
  px: number;
  pz: number;
}

/**
 * A solid floor slab spanning the building footprint, optionally with a
 * rectangular opening (the stairwell). The slab is tiled into up to four
 * collider pieces around the hole — the same segment-splitting idea used for
 * doors/windows in Wall.tsx — so the player can pass between floors.
 */
export default function FloorSlab({ width, depth, baseY, color, thickness = 0.4, opening }: Props) {
  const pieces = useMemo<Piece[]>(() => {
    if (!opening) {
      return [{ w: width, d: depth, px: 0, pz: 0 }];
    }

    const hx0 = opening.x - opening.width / 2;
    const hx1 = opening.x + opening.width / 2;
    const hz0 = opening.z - opening.depth / 2;
    const hz1 = opening.z + opening.depth / 2;

    const halfW = width / 2;
    const halfD = depth / 2;
    const result: Piece[] = [];

    // Back strip (full width, z below the hole)
    const backD = hz0 - -halfD;
    if (backD > 0.01) {
      result.push({ w: width, d: backD, px: 0, pz: -halfD + backD / 2 });
    }
    // Front strip (full width, z above the hole)
    const frontD = halfD - hz1;
    if (frontD > 0.01) {
      result.push({ w: width, d: frontD, px: 0, pz: hz1 + frontD / 2 });
    }
    // Left strip (within the hole's z-range)
    const leftW = hx0 - -halfW;
    if (leftW > 0.01) {
      result.push({ w: leftW, d: opening.depth, px: -halfW + leftW / 2, pz: opening.z });
    }
    // Right strip (within the hole's z-range)
    const rightW = halfW - hx1;
    if (rightW > 0.01) {
      result.push({ w: rightW, d: opening.depth, px: hx1 + rightW / 2, pz: opening.z });
    }

    return result;
  }, [width, depth, opening]);

  return (
    <group position={[0, baseY - thickness / 2, 0]}>
      {pieces.map((p, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid">
          <mesh position={[p.px, 0, p.pz]} receiveShadow>
            <boxGeometry args={[p.w, thickness, p.d]} />
            <meshStandardMaterial color={color} roughness={0.95} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}
