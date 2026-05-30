// apps/web/src/hooks/useEnterBuilding.ts
import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateBuilding } from '../data/maps/floor-generator';
import { buildInteriorSpec } from '../data/maps/building-archetypes';
import type { TownBuildingPlacement } from '../world/town-generator';

const FADE_MS = 500;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nextFrame = () => new Promise((r) => requestAnimationFrame(r));

/**
 * Generates a town building's interior on entry and transitions into it (and
 * back out). Mirrors useZoneTransition's fade, but the destination is a
 * freshly generated, transient building rather than a fixed zone.
 */
export function useEnterBuilding() {
  const { setInterior, clearInterior, setCurrentZone, setPlayerPosition, setPlayerRotation, setTransitionState } =
    useGameStore();

  const enterBuilding = useCallback(
    async (placement: TownBuildingPlacement) => {
      const spec = buildInteriorSpec(placement.type, placement.id, 'interior');
      const building = generateBuilding(spec);
      const returnPos = { x: placement.x, y: 0, z: placement.z + placement.depth / 2 + 2.5 };

      setTransitionState('fadeOut');
      await wait(FADE_MS);

      setInterior(building, returnPos);
      setCurrentZone('interior');
      setPlayerPosition({ x: 0, y: 0, z: building.footprint.depth / 2 - 3 });
      setPlayerRotation(Math.PI);

      await nextFrame();
      setTransitionState('fadeIn');
      setTimeout(() => setTransitionState('idle'), FADE_MS);
    },
    [setInterior, setCurrentZone, setPlayerPosition, setPlayerRotation, setTransitionState],
  );

  const exitBuilding = useCallback(async () => {
    const { interiorReturn } = useGameStore.getState();

    setTransitionState('fadeOut');
    await wait(FADE_MS);

    setCurrentZone('campus_outdoor');
    if (interiorReturn) {
      setPlayerPosition(interiorReturn);
      setPlayerRotation(0);
    }
    clearInterior();

    await nextFrame();
    setTransitionState('fadeIn');
    setTimeout(() => setTransitionState('idle'), FADE_MS);
  }, [clearInterior, setCurrentZone, setPlayerPosition, setPlayerRotation, setTransitionState]);

  return { enterBuilding, exitBuilding };
}
