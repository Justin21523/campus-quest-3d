// apps/web/src/App.tsx
import { Suspense, lazy, useState, useEffect } from 'react';
import Scene3D from './components/Scene3D';
import UIOverlay from './components/UIOverlay';
import type { HealthCheckResponse, PlayerState } from '@campus-quest/shared-types';
import HUD from './components/HUD';
import DebugPanel from './components/DebugPanel';
import { playerApi } from './services/api';
import { useGameStore } from './store/gameStore';
import  InteractionPrompt  from './components/InteractionPrompt'
import DialogueBox from './components/DialogueBox';
import QuestNotification from './components/QuestNotification';
import QuestTracker from './components/QuestTracker';
import InventoryPanel from './components/InventoryPanel';
import { useInventoryStore } from './store/inventoryStore';
import TransitionOverlay from './components/TransitionOverlay';
import MapPanel from './components/MapPanel';
import FastTravelMenu from './components/FastTravelMenu';
import EventSpawner from './components/world/EventSpawner';
import EventNotification from './components/EventNotification';
import ClockHud from './components/ClockHud';
import { useDialogueStore } from './store/dialogueStore';

const MinigameOverlay = lazy(() => import('./components/MinigameOverlay'));

async function fetchHealthStatus(): Promise<HealthCheckResponse | null> {
  try {
    const response = await fetch('/api/health', {
      headers: { Accept: 'application/json' },
    });
    const contentType = response.headers.get('content-type') ?? '';

    if (!response.ok || !contentType.includes('application/json')) {
      return null;
    }

    return await response.json() as HealthCheckResponse;
  } catch {
    return null;
  }
}

function App() {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
  const nearbyInteractable = useGameStore((s) => s.nearbyInteractable);
  const toggleInventory = useInventoryStore((s) => s.toggleInventory);
  const toggleMap = useGameStore((s) => s.toggleMap);
  const setMapOpen = useGameStore((s) => s.setMapOpen);
  
  useEffect(() => {
    const initialize = async () => {
      try {
        // 1. Check health
        const healthData = await fetchHealthStatus();
        setHealthStatus(healthData);

        // 2. Init/Fetch player state
        if (healthData?.status === 'ok') {
          try {
            const player: PlayerState = await playerApi.init('student_001', 'Freshman');
            setPlayerPosition(player.position);
          } catch (error) {
            console.warn('Player sync unavailable:', error);
          }
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, [setPlayerPosition]);
  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'i') {
        toggleInventory();
      } else if (key === 'm') {
        // Don't open the map mid-dialogue; always allow closing it.
        const dialogueOpen = useDialogueStore.getState().isOpen;
        if (!dialogueOpen || useGameStore.getState().isMapOpen) toggleMap();
      } else if (key === 'escape') {
        setMapOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleInventory, toggleMap, setMapOpen]);
  
  return (
    <div className="w-screen h-screen relative">
      {/* 3D Canvas */}
      <Scene3D />
      <HUD />
      <ClockHud />
      <QuestTracker />
      <DebugPanel />
      {/* UI Overlay */}
      <InteractionPrompt
        visible={!!nearbyInteractable}
        label={nearbyInteractable || ''}
      />
      <Suspense fallback={null}>
        <MinigameOverlay />
      </Suspense>
      <DialogueBox />
      <InventoryPanel />
      <MapPanel />
      <FastTravelMenu />
      <EventSpawner />
      <EventNotification />
      <QuestNotification />
      <UIOverlay healthStatus={healthStatus} isLoading={isLoading} />
      <TransitionOverlay />
    </div>
  );
}

export default App;
