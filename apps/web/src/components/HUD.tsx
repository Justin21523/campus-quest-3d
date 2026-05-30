import { useGameStore } from '../store/gameStore';

export default function HUD() {
  const { playerName, health, stamina, staminaMax, movementMode } = useGameStore();
  const staminaPct = staminaMax > 0 ? (stamina / staminaMax) * 100 : 0;
  const staminaColor = movementMode === 'sprint' ? 'bg-amber-400' : 'bg-green-500';

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none">
      <div className="bg-black/50 text-white p-4 rounded-lg max-w-sm pointer-events-auto">
        <h2 className="text-xl font-bold mb-2">{playerName}</h2>
        <div className="mb-2">
          <div className="flex justify-between text-sm">
            <span>HP</span>
            <span>{health}/100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-red-500 h-2.5 rounded-full transition-all" style={{ width: `${health}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm">
            <span>Stamina</span>
            <span>{Math.round(stamina)}/{staminaMax}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className={`${staminaColor} h-2.5 rounded-full transition-all`}
              style={{ width: `${staminaPct}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-white/20 text-xs text-gray-300">
        [I] Inventory • [M] Map • [E] Interact
      </div>
    </div>
  );
}
