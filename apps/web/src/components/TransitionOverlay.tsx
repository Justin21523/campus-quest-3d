// apps/web/src/components/TransitionOverlay.tsx
import { useGameStore } from '../store/gameStore';

export default function TransitionOverlay() {
  const transitionState = useGameStore((s) => s.transitionState);

  if (transitionState === 'idle') return null;

  const opacity = transitionState === 'fadeOut' ? 1 : 0;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black pointer-events-none transition-opacity duration-500 ease-in-out flex items-center justify-center"
      style={{ opacity }}
    >
      {transitionState === 'fadeOut' && (
        <div className="text-white text-lg font-mono animate-pulse">
          Loading...
        </div>
      )}
    </div>
  );
}
