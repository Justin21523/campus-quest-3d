import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

interface UseInteractionOptions {
  targetPosition: THREE.Vector3;
  radius?: number;
  onEnter?: () => void;
  onExit?: () => void;
}

export function useInteraction({
  targetPosition,
  radius = 3,
  onEnter,
  onExit,
}: UseInteractionOptions) {
  const [inRange, setInRange] = useState(false);
  const wasInRange = useRef(false);
  const playerPosition = useGameStore((s) => s.playerPosition);

  useFrame(() => {
    if (!playerPosition) return;

    const dist = Math.sqrt(
      (playerPosition.x - targetPosition.x) ** 2 +
      (playerPosition.z - targetPosition.z) ** 2
    );

    const nowInRange = dist <= radius;

    if (nowInRange && !wasInRange.current) {
      setInRange(true);
      onEnter?.();
    } else if (!nowInRange && wasInRange.current) {
      setInRange(false);
      onExit?.();
    }

    wasInRange.current = nowInRange;
  });

  return inRange;
}
