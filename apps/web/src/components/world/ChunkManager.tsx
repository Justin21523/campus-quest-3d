// apps/web/src/components/world/ChunkManager.tsx
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { chunkKey, chunksInRadius, worldToChunk, type ChunkCoord } from '../../world/chunks';
import Chunk from './Chunk';

/**
 * Streams town chunks around the player: keeps a radius of chunks mounted and
 * unmounts the rest as the player moves, giving an effectively infinite world.
 * Polls the player position via useFrame and only re-renders when the player
 * crosses into a new chunk (so it isn't re-rendering every frame).
 */
export default function ChunkManager() {
  const start = worldToChunk(
    useGameStore.getState().playerPosition.x,
    useGameStore.getState().playerPosition.z,
  );
  const [active, setActive] = useState<ChunkCoord[]>(() => chunksInRadius(start.cx, start.cz));
  const lastKey = useRef(chunkKey(start.cx, start.cz));

  useFrame(() => {
    const p = useGameStore.getState().playerPosition;
    const { cx, cz } = worldToChunk(p.x, p.z);
    const key = chunkKey(cx, cz);
    if (key !== lastKey.current) {
      lastKey.current = key;
      setActive(chunksInRadius(cx, cz));
    }
  });

  return (
    <group>
      {active.map((c) => (
        <Chunk key={chunkKey(c.cx, c.cz)} cx={c.cx} cz={c.cz} />
      ))}
    </group>
  );
}
