// apps/web/src/components/MapPanel.tsx
// Full-screen map overlay (toggled by M). Outdoors it draws streamed town chunks
// (roads + buildings) around the player with undiscovered chunks dimmed; inside a
// building it draws the selected floor's room plan with a floor selector. Player
// position + facing are always shown.
import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useExplorationStore } from '../store/explorationStore';
import { useClockStore } from '../store/clockStore';
import { CAMPUS_ZONES } from '../data/maps';
import { getPoisForZone, type Poi } from '../data/maps/pois';
import { getNpcsAt } from '@campus-quest/game-data';
import { CHUNK_SIZE, chunkKey, worldToChunk } from '../world/chunks';
import { generateChunk } from '../world/town-generator';
import type { GeneratedBuilding } from '../data/maps/floor-generator';

const W = 760;
const H = 560;
const CX = W / 2;
const CY = H / 2;
const OUTDOOR_SCALE = 1.6; // px per world unit
const INTERIOR_SCALE = 5;
const OUTDOOR_RADIUS = 3; // chunks each side

const TOWN_BUILDING_COLORS: Record<string, string> = {
  shop: '#d8b26a',
  cafe: '#d98c5f',
  house: '#9bbf73',
  apartment: '#8aa0c0',
};

interface WorldRect {
  x: number;
  z: number;
  w: number;
  d: number;
  fill: string;
  stroke?: string;
}

/** Build outdoor chunk geometry in WORLD coords; memoised so it only recomputes on crossing. */
function buildOutdoorGeometry(pcx: number, pcz: number, discovered: Set<string>): { rects: WorldRect[]; fog: WorldRect[] } {
  const rects: WorldRect[] = [];
  const fog: WorldRect[] = [];
  for (let dz = -OUTDOOR_RADIUS; dz <= OUTDOOR_RADIUS; dz++) {
    for (let dx = -OUTDOOR_RADIUS; dx <= OUTDOOR_RADIUS; dx++) {
      const cx = pcx + dx;
      const cz = pcz + dz;
      const originX = cx * CHUNK_SIZE;
      const originZ = cz * CHUNK_SIZE;
      const center = { x: originX + CHUNK_SIZE / 2, z: originZ + CHUNK_SIZE / 2 };
      if (!discovered.has(chunkKey(cx, cz))) {
        fog.push({ x: center.x, z: center.z, w: CHUNK_SIZE, d: CHUNK_SIZE, fill: '#0b1220' });
        continue;
      }
      const data = generateChunk(cx, cz);
      rects.push({ x: center.x, z: center.z, w: CHUNK_SIZE, d: CHUNK_SIZE, fill: data.groundColor });
      for (const r of data.roads) rects.push({ x: r.x, z: r.z, w: r.width, d: r.depth, fill: '#5b6470' });
      for (const p of data.parks) rects.push({ x: p.x, z: p.z, w: p.size, d: p.size, fill: '#86b25e' });
      for (const b of data.buildings) {
        rects.push({ x: b.x, z: b.z, w: b.width, d: b.depth, fill: TOWN_BUILDING_COLORS[b.type] ?? '#c0a878', stroke: '#00000055' });
      }
    }
  }
  return { rects, fog };
}

function PlayerMarker({ sx, sy, rot }: { sx: number; sy: number; rot: number }) {
  // Heading on screen: world +z maps downward, so heading = (sin rot, cos rot).
  const hx = Math.sin(rot);
  const hy = Math.cos(rot);
  return (
    <g>
      <line x1={sx} y1={sy} x2={sx + hx * 16} y2={sy + hy * 16} stroke="#22d3ee" strokeWidth={3} />
      <circle cx={sx} cy={sy} r={6} fill="#22d3ee" stroke="#0e7490" strokeWidth={2} />
    </g>
  );
}

function PoiMarker({ sx, sy, poi }: { sx: number; sy: number; poi: Poi }) {
  const color = poi.type === 'npc' ? '#34d399' : poi.type === 'quest' ? '#fbbf24' : '#e2e8f0';
  return (
    <g>
      {poi.type === 'quest' ? (
        <rect x={sx - 5} y={sy - 5} width={10} height={10} fill={color} transform={`rotate(45 ${sx} ${sy})`} />
      ) : (
        <circle cx={sx} cy={sy} r={5} fill={color} stroke="#0008" strokeWidth={1} />
      )}
      <text x={sx + 8} y={sy + 4} fontSize={11} fill="#e5e7eb">{poi.label}</text>
    </g>
  );
}

export default function MapPanel() {
  const isMapOpen = useGameStore((s) => s.isMapOpen);
  const setMapOpen = useGameStore((s) => s.setMapOpen);
  const player = useGameStore((s) => s.playerPosition);
  const playerRot = useGameStore((s) => s.playerRotation);
  const currentZone = useGameStore((s) => s.currentZone);
  const currentFloor = useGameStore((s) => s.currentFloor);
  const interior = useGameStore((s) => s.interior);
  const phase = useClockStore((s) => s.phase);
  const discoveredChunks = useExplorationStore((s) => s.discoveredChunks);

  const building: GeneratedBuilding | null =
    currentZone === 'interior' ? interior : CAMPUS_ZONES[currentZone]?.building ?? null;

  const [selectedFloor, setSelectedFloor] = useState(0);
  useEffect(() => {
    if (isMapOpen) setSelectedFloor(currentFloor);
  }, [isMapOpen, currentFloor]);

  const { cx: pcx, cz: pcz } = worldToChunk(player.x, player.z);
  const discoveredSet = useMemo(() => new Set(discoveredChunks), [discoveredChunks]);
  const outdoor = useMemo(
    () => (building ? null : buildOutdoorGeometry(pcx, pcz, discoveredSet)),
    [building, pcx, pcz, discoveredSet],
  );

  if (!isMapOpen) return null;

  const scale = building ? INTERIOR_SCALE : OUTDOOR_SCALE;
  const sx = (wx: number) => CX + (wx - player.x) * scale;
  const sy = (wz: number) => CY + (wz - player.z) * scale;
  const rect = (r: WorldRect, key: string) => (
    <rect
      key={key}
      x={sx(r.x) - (r.w * scale) / 2}
      y={sy(r.z) - (r.d * scale) / 2}
      width={r.w * scale}
      height={r.d * scale}
      fill={r.fill}
      stroke={r.stroke}
      strokeWidth={r.stroke ? 1 : 0}
    />
  );

  const floor = building?.floors.find((f) => f.level === selectedFloor) ?? building?.floors[0];
  const npcPois: Poi[] = getNpcsAt(currentZone, phase).map((n) => ({
    id: `npc_${n.id}`,
    type: 'npc',
    zone: currentZone,
    x: n.schedule[phase].position[0],
    z: n.schedule[phase].position[2],
    label: n.name,
  }));
  const pois = [...getPoisForZone(currentZone), ...npcPois];

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 pointer-events-auto">
      <div className="bg-gray-900/95 rounded-2xl border border-white/10 p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-white text-lg font-bold">
            Map — {CAMPUS_ZONES[currentZone]?.name ?? currentZone}
          </h2>
          <button
            onClick={() => setMapOpen(false)}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
          >
            Close [M]
          </button>
        </div>

        {building && (
          <div className="flex gap-2 mb-2">
            {building.floors.map((f) => (
              <button
                key={f.level}
                onClick={() => setSelectedFloor(f.level)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedFloor === f.level ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
                title={f.name}
              >
                {f.level + 1}F
              </button>
            ))}
          </div>
        )}

        <svg width={W} height={H} className="rounded-lg bg-[#0b1220]">
          <defs>
            <clipPath id="map-clip">
              <rect x={0} y={0} width={W} height={H} rx={8} />
            </clipPath>
          </defs>
          <g clipPath="url(#map-clip)">
            {/* Outdoor town */}
            {outdoor && outdoor.rects.map((r, i) => rect(r, `r-${i}`))}
            {outdoor && outdoor.fog.map((r, i) => rect(r, `f-${i}`))}

            {/* Interior floor plan */}
            {building && floor && (
              <>
                {rect(
                  { x: 0, z: 0, w: building.footprint.width, d: building.footprint.depth, fill: '#1f2937', stroke: '#334155' },
                  'fp',
                )}
                {rect(
                  { x: 0, z: 0, w: building.corridorWidth, d: building.footprint.depth, fill: building.corridorFloorColor },
                  'corridor',
                )}
                {floor.rooms.map((rm) =>
                  rect({ x: rm.x, z: rm.z, w: rm.width, d: rm.depth, fill: rm.floorColor, stroke: '#11182755' }, `room-${rm.id}`),
                )}
                {floor.rooms.map((rm) => (
                  <text key={`lbl-${rm.id}`} x={sx(rm.x)} y={sy(rm.z)} fontSize={10} fill="#1f2937" textAnchor="middle">
                    {rm.type}
                  </text>
                ))}
                {/* Stairwell */}
                <rect
                  x={sx(building.stairwell.x) - (building.stairWidth * scale) / 2}
                  y={sy(building.stairwell.z) - building.floorHeight * scale * 0.5}
                  width={building.stairWidth * scale}
                  height={building.floorHeight * scale}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                />
                <text x={sx(building.stairwell.x)} y={sy(building.stairwell.z)} fontSize={10} fill="#f59e0b" textAnchor="middle">
                  stairs
                </text>
              </>
            )}

            {/* POI markers (interior NPC/quest only shown on the ground floor) */}
            {pois
              .filter(() => !building || selectedFloor === 0)
              .map((p) => (
                <PoiMarker key={p.id} sx={sx(p.x)} sy={sy(p.z)} poi={p} />
              ))}

            {/* Player (only when the viewed floor matches the player's floor) */}
            {(!building || selectedFloor === currentFloor) && <PlayerMarker sx={CX} sy={CY} rot={playerRot} />}
          </g>
        </svg>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-300">
          <span><span className="text-cyan-400">●</span> Player</span>
          <span><span className="text-emerald-400">●</span> NPC</span>
          <span><span className="text-amber-400">◆</span> Quest</span>
          <span><span className="text-gray-200">▢</span> Building</span>
          <span className="text-gray-500">Dark = unexplored • [M] close</span>
        </div>
      </div>
    </div>
  );
}
