// apps/web/src/components/architecture/Wall.tsx
import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import type { WallSegment } from '@campus-quest/game-data';

interface Props extends WallSegment {
  height: number;
  color: string;
}

const DOOR_WIDTH = 1.2;
const DOOR_HEIGHT = 2.4;
const WINDOW_WIDTH = 1.5;
const WINDOW_HEIGHT = 1.2;

export default function Wall({ x, z, width, rotation, height, color, hasDoor, doorOffset = 0, hasWindow, windowHeight = 1.5 }: Props) {
  const segments = useMemo(() => {
    const segs: { w: number; h: number; d: number; px: number; py: number; pz: number }[] = [];
    const thickness = 0.2;

    if (hasDoor) {
      const doorLeft = (width / 2) + doorOffset - (DOOR_WIDTH / 2);
      const doorRight = (width / 2) + doorOffset + (DOOR_WIDTH / 2);

      // Left segment
      if (doorLeft > 0) {
        segs.push({ w: doorLeft, h: height, d: thickness, px: -width / 2 + doorLeft / 2, py: height / 2, pz: 0 });
      }
      // Right segment
      const rightW = width - doorRight;
      if (rightW > 0) {
        segs.push({ w: rightW, h: height, d: thickness, px: width / 2 - rightW / 2, py: height / 2, pz: 0 });
      }
      // Above door
      const aboveH = height - DOOR_HEIGHT;
      if (aboveH > 0) {
        segs.push({ w: DOOR_WIDTH, h: aboveH, d: thickness, px: doorOffset, py: DOOR_HEIGHT + aboveH / 2, pz: 0 });
      }
    } else if (hasWindow) {
      const winBottom = windowHeight;
      const winTop = windowHeight + WINDOW_HEIGHT;
      const halfWin = WINDOW_WIDTH / 2;

      // Left of window
      const leftW = (width / 2) - halfWin;
      if (leftW > 0) segs.push({ w: leftW, h: height, d: thickness, px: -width / 2 + leftW / 2, py: height / 2, pz: 0 });
      // Right of window
      const rightW = (width / 2) - halfWin;
      if (rightW > 0) segs.push({ w: rightW, h: height, d: thickness, px: width / 2 - rightW / 2, py: height / 2, pz: 0 });
      // Below window
      if (winBottom > 0) segs.push({ w: WINDOW_WIDTH, h: winBottom, d: thickness, px: 0, py: winBottom / 2, pz: 0 });
      // Above window
      const aboveH = height - winTop;
      if (aboveH > 0) segs.push({ w: WINDOW_WIDTH, h: aboveH, d: thickness, px: 0, py: winTop + aboveH / 2, pz: 0 });
    } else {
      // Solid wall
      segs.push({ w: width, h: height, d: thickness, px: 0, py: height / 2, pz: 0 });
    }

    return segs;
  }, [width, height, hasDoor, doorOffset, hasWindow, windowHeight]);

  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      {segments.map((seg, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid">
          <mesh position={[seg.px, seg.py, seg.pz]} castShadow receiveShadow>
            <boxGeometry args={[seg.w, seg.h, seg.d]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}
