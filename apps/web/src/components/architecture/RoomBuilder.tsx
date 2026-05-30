// apps/web/src/components/architecture/RoomBuilder.tsx
import type { RoomDefinition } from '../../data/maps/room-templates';
import Wall from './Wall';
import Furniture from './Furniture';

interface Props {
  room: RoomDefinition & { x?: number; z?: number; baseY?: number };
}

export default function RoomBuilder({ room }: Props) {
  const offsetX = room.x ?? 0;
  const offsetZ = room.z ?? 0;
  const baseY = room.baseY ?? 0;

  return (
    <group position={[offsetX, baseY, offsetZ]}>
      {/* Visual floor only — collision is provided by the building's FloorSlab.
          Lifted slightly so its colour sits just above the structural slab. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[room.width, room.depth]} />
        <meshStandardMaterial color={room.floorColor} />
      </mesh>

      {/* Walls grow from Y=0 to Y=room.height (no ceiling: the slab above caps the room) */}
      {room.walls.map((wall, i) => (
        <Wall key={i} {...wall} height={room.height} color={room.wallColor} />
      ))}

      {/* Furniture relative to floor */}
      {room.furniture.map((furn, i) => (
        <Furniture key={i} {...furn} />
      ))}

      <pointLight position={[0, room.height - 0.5, 0]} intensity={0.35} distance={room.width * 1.5} color="#fffbe6" />
    </group>
  );
}
