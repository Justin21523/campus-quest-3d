// apps/web/src/components/architecture/SchoolExterior.tsx
import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  /** World position of the front-door centre at ground level. */
  position?: [number, number, number];
  width?: number;
  depth?: number;
  floors?: number;
  floorHeight?: number;
  shellColor?: string;
  roofColor?: string;
}

/**
 * A static (non-enterable) school facade shown in the outdoor campus zone so
 * stepping outside reveals a real building + grounds. The player enters via the
 * "Enter Building" portal, not by walking through. The body extends along -z
 * from the front door at the given position.
 */
export default function SchoolExterior({
  position = [0, 0, 0],
  width = 34,
  depth = 24,
  floors = 3,
  floorHeight = 5,
  shellColor = '#d9cbb2',
  roofColor = '#7c5c3b',
}: Props) {
  const H = floors * floorHeight;
  const halfW = width / 2;

  const windowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#bfe3ff',
        emissive: '#9ec9ff',
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const floorIdx = Array.from({ length: floors }, (_, i) => i);

  return (
    <group position={position}>
      {/* Main body (solid) — front face at z=0, extends to -z */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, H / 2, -depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[width, H, depth]} />
          <meshStandardMaterial color={shellColor} roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Roof slab with overhang */}
      <mesh position={[0, H + 0.3, -depth / 2]} castShadow>
        <boxGeometry args={[width + 1, 0.6, depth + 1]} />
        <meshStandardMaterial color={roofColor} roughness={0.85} />
      </mesh>

      {/* Window bands on the front face, one per floor */}
      {floorIdx.map((i) => (
        <mesh key={`fw-${i}`} position={[0, i * floorHeight + 1.9, 0.06]} material={windowMat}>
          <boxGeometry args={[width * 0.82, 1.5, 0.05]} />
        </mesh>
      ))}
      {/* Window bands on both side faces */}
      {floorIdx.map((i) =>
        [-1, 1].map((s) => (
          <mesh key={`sw-${i}-${s}`} position={[s * (halfW + 0.06), i * floorHeight + 1.9, -depth / 2]} material={windowMat}>
            <boxGeometry args={[0.05, 1.5, depth * 0.82]} />
          </mesh>
        )),
      )}

      {/* Recessed entrance doorway on the front face */}
      <mesh position={[0, 1.5, 0.04]}>
        <boxGeometry args={[3.6, 3, 0.1]} />
        <meshStandardMaterial color="#3b2f25" />
      </mesh>

      {/* Entrance porch: steps + two columns + portico roof */}
      {[0, 1, 2].map((i) => (
        <RigidBody key={`step-${i}`} type="fixed" colliders="cuboid">
          <mesh position={[0, 0.15 + i * 0.18, 1.6 - i * 0.5]} receiveShadow castShadow>
            <boxGeometry args={[6, 0.3 + i * 0.18, 1.2 - i * 0.4]} />
            <meshStandardMaterial color="#9aa0a8" />
          </mesh>
        </RigidBody>
      ))}
      {[-2.2, 2.2].map((x) => (
        <mesh key={`col-${x}`} position={[x, 2, 1.5]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 4, 12]} />
          <meshStandardMaterial color="#f0ece2" />
        </mesh>
      ))}
      <mesh position={[0, 4.2, 1.3]} castShadow>
        <boxGeometry args={[6, 0.5, 2.4]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>

      {/* Sign above the entrance */}
      <mesh position={[0, 3.3, 0.12]}>
        <boxGeometry args={[5, 0.9, 0.1]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      <Text position={[0, 3.3, 0.2]} fontSize={0.55} color="#ffd479" anchorX="center" anchorY="middle" maxWidth={6}>
        STARBRIDGE HIGH
      </Text>

      {/* Perimeter fence around the front yard with a gate gap at centre */}
      <Fence width={width + 18} front={26} depth={depth + 12} />
    </group>
  );
}

function Fence({ width, front, depth }: { width: number; front: number; depth: number }) {
  const halfW = width / 2;
  const railColor = '#6b7280';
  const postColor = '#4b5563';
  const gateGap = 4;

  // Posts along the front edge (z = front) skipping the central gate gap.
  const frontPosts: number[] = [];
  for (let x = -halfW; x <= halfW + 0.01; x += 3) frontPosts.push(x);

  return (
    <group>
      {/* Front rail split by the gate */}
      {[-1, 1].map((s) => {
        const segLen = halfW - gateGap / 2;
        return (
          <mesh key={`frail-${s}`} position={[s * (gateGap / 2 + segLen / 2), 0.7, front]}>
            <boxGeometry args={[segLen, 0.15, 0.1]} />
            <meshStandardMaterial color={railColor} />
          </mesh>
        );
      })}
      {frontPosts
        .filter((x) => Math.abs(x) > gateGap / 2 - 0.01)
        .map((x) => (
          <mesh key={`fpost-${x}`} position={[x, 0.5, front]} castShadow>
            <boxGeometry args={[0.12, 1, 0.12]} />
            <meshStandardMaterial color={postColor} />
          </mesh>
        ))}
      {/* Gate pillars */}
      {[-gateGap / 2, gateGap / 2].map((x) => (
        <mesh key={`gate-${x}`} position={[x, 0.9, front]} castShadow>
          <boxGeometry args={[0.3, 1.8, 0.3]} />
          <meshStandardMaterial color={postColor} />
        </mesh>
      ))}
      {/* Side rails */}
      {[-1, 1].map((s) => (
        <mesh key={`srail-${s}`} position={[s * halfW, 0.7, front - depth / 2]}>
          <boxGeometry args={[0.1, 0.15, depth]} />
          <meshStandardMaterial color={railColor} />
        </mesh>
      ))}
    </group>
  );
}
