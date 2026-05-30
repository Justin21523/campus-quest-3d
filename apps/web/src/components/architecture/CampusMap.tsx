// apps/web/src/components/architecture/CampusMap.tsx
import { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CAMPUS_ZONES, getConnectionsFromZone } from '../../data/maps';
import { CAMPUS_BUILDING_LAYOUTS } from '../../data/maps/buildings';
import ZonePortal from './ZonePortal';
import Building from './Building';
import SchoolExterior from './SchoolExterior';
import ChunkManager from '../world/ChunkManager';
import InteriorExitPortal from '../world/InteriorExitPortal';

export default function CampusMap() {
  const currentZone = useGameStore((s) => s.currentZone);
  const interior = useGameStore((s) => s.interior);

  const connections = useMemo(() => getConnectionsFromZone(currentZone), [currentZone]);
  const zone = CAMPUS_ZONES[currentZone];

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

      {/* Streamed infinite town with the school at the origin */}
      {zone?.streamedTown && (
        <group>
          <ChunkManager />
          <SchoolExterior position={[0, 0, 0]} />
          {/* Themed campus buildings (library / academic / club) with entrances */}
          {CAMPUS_BUILDING_LAYOUTS.map((b) => (
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
        </group>
      )}

      {/* Portals (school front door <-> town) */}
      {connections.map((conn) => (
        <ZonePortal key={conn.id} connection={conn} />
      ))}
    </group>
  );
}
