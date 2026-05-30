// apps/web/src/components/architecture/Stairs.tsx
import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';

interface Props {
  /** Bottom-centre of the flight, at the lower floor's walking surface. */
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  /** Vertical rise of the flight (= floor-to-floor height). */
  rise?: number;
  /** Horizontal run of the flight along +z. */
  run?: number;
  steps?: number;
  color?: string;
}

/**
 * A solid, walkable staircase. Each step is a filled block from the floor up to
 * its tread, so there are no gaps — the kinematic character controller's
 * autostep walks the player up the treads step-by-step (and snap-to-ground
 * keeps them planted coming down). The flight rises along +z: local (0,0,0) is
 * the bottom, local (0,rise,run) is the top.
 */
export default function Stairs({
  position,
  rotation = [0, 0, 0],
  width = 2.4,
  rise = 4,
  run = 6,
  steps = 18,
  color = '#6b7280',
}: Props) {
  const stepGeometries = useMemo(() => {
    const stepH = rise / steps;
    const stepD = run / steps;
    return Array.from({ length: steps }, (_, i) => {
      const topY = stepH * (i + 1); // each step is filled from the floor to its tread
      return {
        pos: [0, topY / 2, stepD * (i + 0.5)] as [number, number, number],
        size: [width, topY, stepD] as [number, number, number],
      };
    });
  }, [width, rise, run, steps]);

  const rampLength = Math.sqrt(rise * rise + run * run);
  const rampAngle = Math.atan2(rise, run);

  return (
    <group position={position} rotation={rotation}>
      {/* Solid steps (real colliders the controller climbs) */}
      {stepGeometries.map((step, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid">
          <mesh position={step.pos} castShadow receiveShadow>
            <boxGeometry args={step.size} />
            <meshStandardMaterial color={color} />
          </mesh>
        </RigidBody>
      ))}

      {/* Side rails (visual, sloped to match the flight) */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (width / 2 + 0.06), rise / 2 + 0.55, run / 2]}
          rotation={[-rampAngle, 0, 0]}
          castShadow
        >
          <boxGeometry args={[0.1, 0.8, rampLength]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
      ))}
    </group>
  );
}
