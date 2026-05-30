import { useGameStore } from '../store/gameStore';

export default function DebugPanel() {
  const { isDebugMode, toggleDebugMode, playerPosition } = useGameStore();

  if (!isDebugMode) return null;

  return (
    <div className="absolute bottom-0 right-0 p-4 pointer-events-none">
      <div className="bg-gray-800/80 text-green-400 p-4 rounded-lg font-mono text-sm pointer-events-auto">
        <h3 className="text-lg font-bold mb-2 text-white">Debug Panel</h3>
        <p>Player Pos: X:{playerPosition.x.toFixed(2)} Y:{playerPosition.y.toFixed(2)} Z:{playerPosition.z.toFixed(2)}</p>
        <p>FPS: (Check Stats in top-left)</p>
        <button 
          onClick={toggleDebugMode}
          className="mt-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
        >
          Close Debug
        </button>
      </div>
    </div>
  );
}
