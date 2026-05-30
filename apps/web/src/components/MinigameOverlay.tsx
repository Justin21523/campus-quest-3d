import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import LibrarySortScene from '../phaser/scenes/LibrarySortScene';
import { useQuestStore } from '../store/questStore';

const SCENE_MAP: Record<string, typeof Phaser.Scene> = {
  LibrarySortScene,
  // Future scenes registered here
};

export default function MiniGameOverlay() {
  const { activeMiniGame, closeMiniGame, completeMiniGame } = useQuestStore();
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeMiniGame && containerRef.current && !gameRef.current) {
      const SceneClass = SCENE_MAP[activeMiniGame];
      if (!SceneClass) {
        console.error(`Unknown mini-game scene: ${activeMiniGame}`);
        closeMiniGame();
        return;
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: containerRef.current,
        backgroundColor: '#1a1a2e',
        scene: [SceneClass],
        physics: { default: 'arcade' },
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      };
      gameRef.current = new Phaser.Game(config);

      // Listen for completion event from Phaser
      gameRef.current.events.on('minigame-complete', () => {
        completeMiniGame(activeMiniGame);
      });
    }
    
    if (!activeMiniGame && gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [activeMiniGame, closeMiniGame, completeMiniGame]);

  if (!activeMiniGame) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative">
        <button
          onClick={closeMiniGame}
          className="absolute -top-10 right-0 text-white hover:text-red-400 font-bold transition-colors"
        >
          ✕ EXIT MINI-GAME
        </button>
        <div
          ref={containerRef}
          className="rounded-lg overflow-hidden shadow-2xl border-2 border-indigo-500"
        />
      </div>
    </div>
  );
}
