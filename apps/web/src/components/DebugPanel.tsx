import { useGameStore } from '../store/gameStore';

export default function DebugPanel() {
  const isDebugMode = useGameStore((s) => s.isDebugMode);
  const toggleDebugMode = useGameStore((s) => s.toggleDebugMode);
  const playerPosition = useGameStore((s) => s.playerPosition);
  const velocity = useGameStore((s) => s.velocity);
  const grounded = useGameStore((s) => s.grounded);
  const currentFloor = useGameStore((s) => s.currentFloor);
  const currentZone = useGameStore((s) => s.currentZone);
  const stamina = useGameStore((s) => s.stamina);
  const staminaMax = useGameStore((s) => s.staminaMax);
  const movementMode = useGameStore((s) => s.movementMode);

  if (!isDebugMode) return null;

  const f = (n: number) => n.toFixed(2);

  return (
    <div className="absolute bottom-0 right-0 p-4 pointer-events-none">
      <div className="bg-gray-800/80 text-green-400 p-4 rounded-lg font-mono text-sm pointer-events-auto space-y-0.5">
        <h3 className="text-lg font-bold mb-2 text-white">Debug Panel</h3>
        <p>Pos: X:{f(playerPosition.x)} Y:{f(playerPosition.y)} Z:{f(playerPosition.z)}</p>
        <p>Vel: X:{f(velocity.x)} Y:{f(velocity.y)} Z:{f(velocity.z)}</p>
        <p>Grounded: {grounded ? 'Yes' : 'No'}</p>
        <p>Floor: {currentFloor}</p>
        <p>Zone: {currentZone}</p>
        <p>Stamina: {Math.round(stamina)}/{staminaMax}</p>
        <p>Mode: {movementMode}</p>
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
