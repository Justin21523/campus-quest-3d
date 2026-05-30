// apps/web/src/data/maps/pois.ts
// Static points of interest drawn as markers on the full-screen map: quest spots
// and outdoor building entrances. Building entrances are derived from the campus
// building layout so they stay in sync. NPC markers are sourced dynamically from
// the NPC registry (by current zone + day-phase) inside MapPanel.
import { CAMPUS_BUILDING_LAYOUTS } from './buildings';

export type PoiType = 'npc' | 'quest' | 'building';

export interface Poi {
  id: string;
  type: PoiType;
  zone: string;
  x: number;
  z: number;
  label: string;
}

const QUEST_POIS: Poi[] = [
  { id: 'quest_library_sort', type: 'quest', zone: 'main_building_1f', x: 0, z: -3, label: 'Start Sorting' },
];

const BUILDING_ENTRANCE_POIS: Poi[] = [
  { id: 'ent_main', type: 'building', zone: 'campus_outdoor', x: 0, z: 0, label: 'Main Building' },
  ...CAMPUS_BUILDING_LAYOUTS.map((b) => ({
    id: `ent_${b.zoneId}`,
    type: 'building' as const,
    zone: 'campus_outdoor',
    x: b.exteriorPosition[0],
    z: b.exteriorPosition[2],
    label: b.label,
  })),
];

export const POIS: Poi[] = [...QUEST_POIS, ...BUILDING_ENTRANCE_POIS];

export function getPoisForZone(zone: string): Poi[] {
  return POIS.filter((p) => p.zone === zone);
}
