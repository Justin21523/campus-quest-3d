import { useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useMetricsStore } from '../store/metricsStore';
import type { Vector3 } from '@campus-quest/shared-types';

export interface SyncOptions {
  playerId: string;
  throttleMs?: number; // Default: 200ms
}

export function useOptimisticSync({ playerId, throttleMs = 200 }: SyncOptions) {
  const lastFlushRef = useRef(0);
  const applyUpdate = useGameStore((s) => s.applyOptimisticUpdate);
  const flushQueue = useGameStore((s) => s.flushSyncQueue);
  const updateMetrics = useMetricsStore((s) => s.update);

  /**
   * Optimistically update local state, then sync to server with throttling
   */
  const syncPosition = useCallback((position: Vector3, rotation: number) => {
    if (!playerId) return;

    // 1. Apply optimistic update immediately
    applyUpdate({ position, rotation });

    // 2. Throttled flush to server
    const now = Date.now();
    if (now - lastFlushRef.current >= throttleMs) {
      lastFlushRef.current = now;
      const start = performance.now();
      
      flushQueue().then(() => {
        updateMetrics({ lastSyncLatencyMs: performance.now() - start });
      });
    }
  }, [applyUpdate, flushQueue, playerId, throttleMs, updateMetrics]);

  /**
   * Force flush pending syncs (e.g., on zone transition)
   */
  const forceFlush = useCallback(async () => {
    const start = performance.now();
    await flushQueue();
    updateMetrics({ lastSyncLatencyMs: performance.now() - start });
  }, [flushQueue, updateMetrics]);

  return { syncPosition, forceFlush };
}