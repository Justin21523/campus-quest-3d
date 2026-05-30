// apps/web/src/hooks/useFastTravel.ts
// Fast travel between school districts. Builds a one-off ZoneConnection to a
// district's outdoor spawn and reuses the standard zone transition (fade →
// switch zone → spawn). Arriving at a district unlocks it for map fast travel.
import { useCallback } from 'react';
import type { ZoneConnection } from '../data/maps';
import type { SchoolDistrict } from '../data/maps/schools';
import { useZoneTransition } from './useZoneTransition';
import { useGameStore } from '../store/gameStore';
import { useTravelStore } from '../store/travelStore';

export function useFastTravel() {
  const { triggerTransition } = useZoneTransition();
  const unlock = useTravelStore((s) => s.unlock);
  const closeFastTravel = useTravelStore((s) => s.closeFastTravel);

  const travelTo = useCallback(
    (district: SchoolDistrict) => {
      const connection: ZoneConnection = {
        id: `fast_travel_${district.id}`,
        fromZone: useGameStore.getState().currentZone,
        toZone: district.id,
        portalPosition: { x: 0, y: 0, z: 0 },
        portalSize: { width: 0, height: 0 },
        portalRotation: 0,
        spawnPoint: district.spawn,
        spawnRotation: 0,
        label: district.name,
      };
      unlock(district.id);
      closeFastTravel();
      void triggerTransition(connection);
    },
    [triggerTransition, unlock, closeFastTravel],
  );

  return { travelTo };
}
