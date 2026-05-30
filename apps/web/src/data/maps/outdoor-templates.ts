// apps/web/src/data/maps/outdoor-templates.ts
export interface OutdoorPropPlacement {
  type: 'tree' | 'bench' | 'lamppost' | 'fountain' | 'signpost' | 'bush';
  x: number;
  z: number;
  rotation?: number;
  scale?: [number, number, number];
}

export interface RoadSegment {
  x: number;
  z: number;
  width: number;
  depth: number;
  rotation: number;
}

export interface OutdoorAreaDefinition {
  id: string;
  name: string;
  width: number;
  depth: number;
  groundColor: string;
  roads: RoadSegment[];
  props: OutdoorPropPlacement[];
}

export const OUTDOOR_TEMPLATES: Record<string, OutdoorAreaDefinition> = {
  campus_plaza: {
    id: 'campus_plaza',
    name: 'Campus Plaza',
    width: 120,
    depth: 120,
    groundColor: '#7c9a5e',
    roads: [
      // Main path leading away from the building entrance (entrance at z=0)
      { x: 0, z: 14, width: 4, depth: 28, rotation: 0 },
      // Cross path through the yard
      { x: 0, z: 18, width: 36, depth: 3, rotation: 0 },
    ],
    props: [
      // Trees framing the yard
      { type: 'tree', x: -10, z: 8 },
      { type: 'tree', x: 10, z: 8 },
      { type: 'tree', x: -16, z: 16 },
      { type: 'tree', x: 16, z: 16 },
      { type: 'tree', x: -22, z: 28 },
      { type: 'tree', x: 22, z: 28 },
      { type: 'tree', x: -12, z: 34 },
      { type: 'tree', x: 12, z: 34 },
      { type: 'tree', x: -26, z: 6 },
      { type: 'tree', x: 26, z: 6 },
      // Seating
      { type: 'bench', x: -6, z: 13, rotation: Math.PI / 2 },
      { type: 'bench', x: 6, z: 13, rotation: -Math.PI / 2 },
      { type: 'bench', x: -6, z: 24, rotation: Math.PI / 2 },
      { type: 'bench', x: 6, z: 24, rotation: -Math.PI / 2 },
      // Lamps along the path
      { type: 'lamppost', x: -3, z: 6 },
      { type: 'lamppost', x: 3, z: 6 },
      { type: 'lamppost', x: -3, z: 20 },
      { type: 'lamppost', x: 3, z: 20 },
      { type: 'lamppost', x: -3, z: 32 },
      { type: 'lamppost', x: 3, z: 32 },
      // Centrepiece + wayfinding
      { type: 'fountain', x: 0, z: 28 },
      { type: 'signpost', x: 2.5, z: 7, rotation: Math.PI },
      // Hedges
      { type: 'bush', x: -8, z: 4 },
      { type: 'bush', x: 8, z: 4 },
      { type: 'bush', x: -14, z: 22 },
      { type: 'bush', x: 14, z: 22 },
      { type: 'bush', x: -10, z: 30 },
      { type: 'bush', x: 10, z: 30 },
    ],
  },
};
