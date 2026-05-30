// apps/web/src/components/architecture/Building.tsx
import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import type { GeneratedBuilding } from '../../data/maps/campus-zones';
import { floorBaseY } from '../../data/maps/campus-zones';
import { ROOM_HEIGHT } from '../../data/maps/room-templates';
import RoomBuilder from './RoomBuilder';
import FloorSlab, { type SlabOpening } from './FloorSlab';
import Stairs from './Stairs';
import Wall from './Wall';

interface Props {
  building: GeneratedBuilding;
}

const WALL_T = 0.3;
const STAIR_RUN = 6;
const DOOR_WIDTH = 3.6;
const DOOR_HEIGHT = 2.8;

function ExteriorWall({
  size,
  position,
  color,
}: {
  size: [number, number, number];
  position: [number, number, number];
  color: string;
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </RigidBody>
  );
}

/**
 * Renders an entire generated building: per-floor slabs (with the stairwell
 * hole), procedurally placed rooms, generated corridor walls, a staircase per
 * gap, the exterior shell + window bands, and a roof. Everything scales off the
 * generated footprint and `floors.length`.
 */
export default function Building({ building }: Props) {
  const { footprint, floorHeight, stairwell, stairWidth, floors, shellColor, roofColor, corridorWidth } = building;

  const n = floors.length;
  const H = n * floorHeight;
  const halfW = footprint.width / 2;
  const halfD = footprint.depth / 2;

  // The hole covers ONLY the stairs (offset to one side), leaving a solid
  // walkway on the other side of the corridor. Its back edge sits at the top of
  // the flight, so the player steps off onto solid floor at the top.
  const stairBottomZ = stairwell.z + STAIR_RUN / 2;
  const flightTopZ = stairwell.z - STAIR_RUN / 2;
  const opening: SlabOpening = useMemo(() => {
    const holeFront = stairwell.z + 1;
    const holeBack = flightTopZ;
    return {
      x: stairwell.x,
      z: (holeFront + holeBack) / 2,
      width: stairWidth + 0.4,
      depth: holeFront - holeBack,
    };
  }, [stairwell.x, stairwell.z, stairWidth, flightTopZ]);

  const windowMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#bfe3ff',
        emissive: '#9ec9ff',
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      }),
    [],
  );

  return (
    <group>
      {/* Structural slabs (ground solid; upper floors get the stairwell hole) */}
      {floors.map((floor) => (
        <FloorSlab
          key={`slab-${floor.level}`}
          width={footprint.width}
          depth={footprint.depth}
          baseY={floorBaseY(floor.level)}
          color={floor.level % 2 === 0 ? '#b7bcc4' : '#aab0b8'}
          opening={floor.level > 0 ? opening : undefined}
        />
      ))}

      {/* Roof */}
      <FloorSlab width={footprint.width} depth={footprint.depth} baseY={H} color={roofColor} thickness={0.5} />

      {/* Corridor floor strips + generated corridor walls, per floor */}
      {floors.map((floor) => (
        <group key={`corridor-${floor.level}`} position={[0, floor.baseY, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} receiveShadow>
            <planeGeometry args={[corridorWidth, footprint.depth]} />
            <meshStandardMaterial color={building.corridorFloorColor} />
          </mesh>
          {floor.corridorWalls.map((wall, i) => (
            <Wall key={i} {...wall} height={ROOM_HEIGHT} color={building.corridorWallColor} />
          ))}
        </group>
      ))}

      {/* Procedurally placed rooms */}
      {floors.map((floor) => floor.rooms.map((room) => <RoomBuilder key={room.id} room={room} />))}

      {/* One staircase per gap between consecutive floors */}
      {floors.slice(0, -1).map((floor) => (
        <Stairs
          key={`stairs-${floor.level}`}
          position={[stairwell.x, floorBaseY(floor.level), stairBottomZ]}
          rotation={[0, Math.PI, 0]}
          width={stairWidth}
          rise={floorHeight}
          run={STAIR_RUN}
          steps={Math.max(16, Math.round(floorHeight / 0.25))}
          color={shellColor}
        />
      ))}

      {/* Exterior shell */}
      <ExteriorWall size={[footprint.width, H, WALL_T]} position={[0, H / 2, -halfD]} color={shellColor} />
      <ExteriorWall size={[WALL_T, H, footprint.depth]} position={[-halfW, H / 2, 0]} color={shellColor} />
      <ExteriorWall size={[WALL_T, H, footprint.depth]} position={[halfW, H / 2, 0]} color={shellColor} />

      {/* Front wall with a ground-level entrance doorway */}
      {(() => {
        const sideW = halfW - DOOR_WIDTH / 2;
        const lintelH = H - DOOR_HEIGHT;
        return (
          <group>
            <ExteriorWall size={[sideW, H, WALL_T]} position={[-(DOOR_WIDTH / 2 + sideW / 2), H / 2, halfD]} color={shellColor} />
            <ExteriorWall size={[sideW, H, WALL_T]} position={[DOOR_WIDTH / 2 + sideW / 2, H / 2, halfD]} color={shellColor} />
            {lintelH > 0 && (
              <ExteriorWall size={[DOOR_WIDTH, lintelH, WALL_T]} position={[0, DOOR_HEIGHT + lintelH / 2, halfD]} color={shellColor} />
            )}
          </group>
        );
      })()}

      {/* Window bands per floor on the back and side walls */}
      {floors.map((floor) => {
        const y = floorBaseY(floor.level) + 1.9;
        return (
          <group key={`win-${floor.level}`}>
            <mesh position={[0, y, -halfD - 0.02]} material={windowMat}>
              <boxGeometry args={[footprint.width * 0.78, 1.4, 0.06]} />
            </mesh>
            <mesh position={[-halfW - 0.02, y, 0]} material={windowMat}>
              <boxGeometry args={[0.06, 1.4, footprint.depth * 0.78]} />
            </mesh>
            <mesh position={[halfW + 0.02, y, 0]} material={windowMat}>
              <boxGeometry args={[0.06, 1.4, footprint.depth * 0.78]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
