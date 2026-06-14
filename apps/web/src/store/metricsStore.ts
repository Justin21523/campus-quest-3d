// apps/web/src/store/metricsStore.ts
import { create } from "zustand";

export interface DevMetrics {
  activeChunkCount: number;
  chunkLoadQueue: number;
  llmLatencyMs: number;
  syncQueueLength: number;
  lastSyncLatencyMs: number;
  physicsBodiesSleeping: number;
}

interface MetricsStore {
  metrics: DevMetrics;
  update: (partial: Partial<DevMetrics>) => void;
  reset: () => void;
}

export const useMetricsStore = create<MetricsStore>((set) => ({
  metrics: {
    activeChunkCount: 0,
    chunkLoadQueue: 0,
    llmLatencyMs: 0,
    syncQueueLength: 0,
    lastSyncLatencyMs: 0,
    physicsBodiesSleeping: 0,
  },
  update: (partial) =>
    set((state) => ({ metrics: { ...state.metrics, ...partial } })),
  reset: () =>
    set({
      metrics: {
        activeChunkCount: 0,
        chunkLoadQueue: 0,
        llmLatencyMs: 0,
        syncQueueLength: 0,
        lastSyncLatencyMs: 0,
        physicsBodiesSleeping: 0,
      },
    }),
}));