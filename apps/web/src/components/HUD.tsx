import { useGameStore } from '../store/gameStore';

export default function HUD() {
  const { playerName, health, stamina } = useGameStore();

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
            <span>{stamina}/100</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${stamina}%` }}></div>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-white/20 text-xs text-gray-300">
        [I] Inventory • [E] Interact
      </div>
    </div>
  );
}
