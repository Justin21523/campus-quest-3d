// apps/web/src/components/UIOverlay.tsx
import type { HealthCheckResponse } from '@campus-quest/shared-types';
import { Activity, Package, Map, Bug } from 'lucide-react';
import { clsx } from 'clsx';
import { useGameStore } from '../store/gameStore';
import { useInventoryStore } from '../store/inventoryStore';

interface UIOverlayProps {
  healthStatus: HealthCheckResponse | null;
  isLoading: boolean;
}

export default function UIOverlay({ healthStatus, isLoading }: UIOverlayProps) {
  const toggleInventory = useInventoryStore((s) => s.toggleInventory);
  const toggleMap = useGameStore((s) => s.toggleMap);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
      {/* Top HUD */}
      <div className="flex justify-between items-start pointer-events-auto">
        {/* Player Status */}
        <div className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 text-white">
          <h2 className="text-lg font-bold text-primary">Starbridge Academy</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="w-full h-full bg-red-500"></div>
            </div>
            <span className="text-xs">HP 100/100</span>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 text-white flex items-center gap-2">
          <Activity size={16} className={clsx(isLoading ? 'text-yellow-500 animate-pulse' : healthStatus?.status === 'ok' ? 'text-green-500' : 'text-red-500')} />
          <span className="text-xs font-mono">
            {isLoading ? 'Connecting...' : healthStatus?.status === 'ok' ? 'System Online' : 'System Offline'}
          </span>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex justify-center pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 flex gap-2">
          <button
            onClick={toggleInventory}
            className="p-3 hover:bg-white/10 rounded-lg transition text-white"
            title="Inventory [I]"
          >
            <Package size={24} />
          </button>
          <button
            onClick={toggleMap}
            className="p-3 hover:bg-white/10 rounded-lg transition text-white"
            title="Map [M]"
          >
            <Map size={24} />
          </button>
          <button className="p-3 hover:bg-white/10 rounded-lg transition text-white" title="Quests">
            <Bug size={24} />
          </button>
        </div>
      </div>

      {/* Debug Panel (Bottom Right) */}
      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/10 text-white text-xs font-mono max-w-xs pointer-events-auto">
        <h3 className="text-yellow-400 font-bold mb-1 flex items-center gap-1">
          <Bug size={12} /> Debug Panel
        </h3>
        <p>API: {healthStatus?.service || 'Unknown'}</p>
        <p>AI Service: {healthStatus?.dependencies?.aiService || 'Unknown'}</p>
        <p>Player Pos: X: 0.0 Y: 0.5 Z: 0.0</p>
        <p>FPS: 60 (Target)</p>
      </div>
    </div>
  );
}
