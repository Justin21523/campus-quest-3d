// apps/web/src/hooks/useZoneTransition.ts
import { useCallback } from 'react';
import type { ZoneConnection } from '../data/maps';
import { useGameStore } from '../store/gameStore';

export function useZoneTransition() {
  const { setCurrentZone, setPlayerPosition, setPlayerRotation, setTransitionState } = useGameStore();

  const triggerTransition = useCallback(async (connection: ZoneConnection) => {
    // 1. Start fade out
    setTransitionState('fadeOut');

    // 2. Wait for fade out animation
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 3. Switch zone and reposition player
    setCurrentZone(connection.toZone);
    setPlayerPosition(connection.spawnPoint);
    setPlayerRotation(connection.spawnRotation);

    // 4. Wait one frame for new scene to mount
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // 5. Fade in
    setTransitionState('fadeIn');

    // 6. Clear transition state after fade in
    setTimeout(() => {
      setTransitionState('idle');
    }, 500);
  }, [setCurrentZone, setPlayerPosition, setPlayerRotation, setTransitionState]);

  return { triggerTransition };
}
