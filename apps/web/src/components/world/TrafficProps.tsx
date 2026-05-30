// apps/web/src/components/world/TrafficProps.tsx
// Static (and one self-animating) ambient street furniture for city traffic:
// sidewalks, zebra crosswalks, and traffic-light poles whose heads pulse with
// the shared isAxisGreen() cycle. None carry physics colliders.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { isAxisGreen } from '../../world/trafficSignal';
import type { SidewalkStrip, CrosswalkPatch, TrafficLightSpec, RoadAxis } from '../../world/traffic';

const ROAD_W = 8;

/** Thin gray walking strip flush with the ground. */
export function Sidewalk({ strip }: { strip: SidewalkStrip }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[strip.x, 0.04, strip.z]}
      receiveShadow
    >
      <planeGeometry args={[strip.width, strip.depth]} />
      <meshStandardMaterial color="#9aa0a6" roughness={0.9} />
    </mesh>
  );
}

/** Set of white stripes spanning a road width, perpendicular to traffic. */
export function Crosswalk({ patch }: { patch: CrosswalkPatch }) {
  const bars = 5;
  const barLen = ROAD_W; // span the road width
  const barThick = 0.6;
  const spacing = 1.1;
  const start = -((bars - 1) * spacing) / 2;
  return (
    <group position={[patch.x, 0.05, patch.z]}>
      {Array.from({ length: bars }).map((_, i) => {
        const off = start + i * spacing;
        // axis 'x': road runs along x → stripes elongated along z, arrayed along x.
        // axis 'z': road runs along z → stripes elongated along x, arrayed along z.
        const pos: [number, number, number] =
          patch.axis === 'x' ? [off, 0, 0] : [0, 0, off];
        const size: [number, number] =
          patch.axis === 'x' ? [barThick, barLen] : [barLen, barThick];
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={pos}>
            <planeGeometry args={size} />
            <meshStandardMaterial color="#f1f3f4" roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Pole with a red/green head synced to the shared light cycle. */
export function TrafficLight({ spec }: { spec: TrafficLightSpec }) {
  const redRef = useRef<THREE.MeshStandardMaterial>(null);
  const greenRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const green = isAxisGreen(state.clock.elapsedTime, spec.axis as RoadAxis);
    if (redRef.current) redRef.current.emissiveIntensity = green ? 0.05 : 1.4;
    if (greenRef.current) greenRef.current.emissiveIntensity = green ? 1.4 : 0.05;
  });

  return (
    <group position={[spec.x, 0, spec.z]}>
      {/* Pole */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 3.2, 8]} />
        <meshStandardMaterial color="#2b2f33" roughness={0.7} />
      </mesh>
      {/* Signal housing */}
      <mesh position={[0, 3.3, 0]} castShadow>
        <boxGeometry args={[0.4, 0.9, 0.3]} />
        <meshStandardMaterial color="#15181b" roughness={0.6} />
      </mesh>
      {/* Red lamp */}
      <mesh position={[0, 3.55, 0.18]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial ref={redRef} color="#ff4d4d" emissive="#ff2020" emissiveIntensity={1.4} />
      </mesh>
      {/* Green lamp */}
      <mesh position={[0, 3.05, 0.18]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial ref={greenRef} color="#3ddc6b" emissive="#1fcf57" emissiveIntensity={0.05} />
      </mesh>
    </group>
  );
}
