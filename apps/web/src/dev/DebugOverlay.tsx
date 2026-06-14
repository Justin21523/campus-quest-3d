// apps/web/src/dev/DebugOverlay.tsx
import { useEffect, useState } from "react";
import { useMetricsStore } from "../store/metricsStore";
import { useGameStore } from "../store/gameStore";

export function DebugOverlay() {
  const [isVisible, setIsVisible] = useState(import.meta.env.DEV);
  const metrics = useMetricsStore((s) => s.metrics);
  const queueLen = useGameStore((s) => s.syncQueue.length);

  // Toggle with `~` key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "`" || e.key === "~") setIsVisible((v) => !v);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/70 backdrop-blur text-green-400 font-mono text-xs p-3 rounded border border-green-800 pointer-events-none select-none">
      <div className="font-bold mb-1 text-green-300">🛠️ DEV OVERLAY</div>
      <div>📦 Chunks: {metrics.activeChunkCount} (Queue: {metrics.chunkLoadQueue})</div>
      <div>🌙 Physics Sleeping: {metrics.physicsBodiesSleeping}</div>
      <div>🔄 Sync Queue: {queueLen} | Last: {metrics.lastSyncLatencyMs.toFixed(1)}ms</div>
      <div>🤖 LLM Latency: {metrics.llmLatencyMs.toFixed(1)}ms</div>
      <div className="mt-2 text-gray-400 text-[10px]">Press ` to toggle</div>
    </div>
  );
}