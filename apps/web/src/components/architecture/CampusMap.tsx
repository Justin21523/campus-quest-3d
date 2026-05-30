// apps/web/src/components/architecture/CampusMap.tsx
import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CAMPUS_ZONES, getConnectionsFromZone } from '../../data/maps';
import { getOutdoorLayoutForZone } from '../../data/maps/schools';
import ZonePortal from './ZonePortal';
import Building from './Building';
import SchoolExterior from './SchoolExterior';
import ChunkManager from '../world/ChunkManager';
import BusStop from '../world/BusStop';
import InteriorExitPortal from '../world/InteriorExitPortal';

export default function CampusMap() {
  const currentZone = useGameStore((s) => s.currentZone);
  const interior = useGameStore((s) => s.interior);

  const connections = useMemo(() => getConnectionsFromZone(currentZone), [currentZone]);
  const zone = CAMPUS_ZONES[currentZone];
  const outdoor = useMemo(() => getOutdoorLayoutForZone(currentZone), [currentZone]);

  // A generated, on-entry town interior (shop / house / cafe).
  if (currentZone === 'interior' && interior) {
    return (
      <group>
        <Building building={interior} />
        <InteriorExitPortal building={interior} />
      </group>
    );
  }

  return (
    <group>
      {/* School interior (fixed multi-floor building) */}
      {zone?.building && <Building building={zone.building} />}

      {/* Streamed infinite town with the current district's school at the origin */}
      {zone?.streamedTown && outdoor && (
        <group>
          <ChunkManager />
          {/* Main school for this district */}
          <SchoolExterior
            position={outdoor.main.position}
            width={outdoor.main.width}
            depth={outdoor.main.depth}
            floors={outdoor.main.floors}
            shellColor={outdoor.main.shellColor}
            roofColor={outdoor.main.roofColor}
            label={outdoor.main.label}
          />
          {/* Extra themed buildings (home district only) with entrances */}
          {outdoor.extras.map((b) => (
            <SchoolExterior
              key={b.zoneId}
              position={b.exteriorPosition}
              width={b.width}
              depth={b.depth}
              floors={b.floors}
              shellColor={b.shellColor}
              roofColor={b.roofColor}
              label={b.label}
              showFence={false}
            />
          ))}
          {/* Bus stop near the spawn for fast travel */}
          <BusStop position={outdoor.busStop} />
        </group>
      )}

      {/* Portals (school front door <-> town) */}
      {connections.map((conn) => (
        <ZonePortal key={conn.id} connection={conn} />
      ))}
    </group>
  );
}
