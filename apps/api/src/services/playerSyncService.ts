// apps/api/src/services/playerSyncService.ts
import { Player, type IPlayer, type InventoryItem } from '../models/Player.model.js';
import type { QuestStatus, Vector3 } from '@campus-quest/shared-types';

export interface SyncDelta {
  position?: Vector3;
  rotation?: number;
  inventory_delta?: { added?: InventoryItem[]; removed?: string[] };
  quest_progress?: Record<string, { status: QuestStatus; objectiveIndex?: number }>;
  timestamp?: number;
}

export interface SyncResult {
  success: boolean;
  merged: Partial<IPlayer>;
  conflicts: string[];
  serverTimestamp: number;
}

/**
 * Server-authoritative sync service
 * Strategy: Last-Write-Wins with vector clock comparison
 */
export class PlayerSyncService {
  /**
   * Merge client delta with server state, detect conflicts
   */
  static async mergeSync(
    playerId: string,
    delta: SyncDelta,
    clientTimestamp?: number
  ): Promise<SyncResult> {
    const player = await Player.findOne({ playerId });
    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }

    const conflicts: string[] = [];
    const serverTime = Date.now();
    const merged: Partial<IPlayer> = { lastLogin: new Date(serverTime) };

    // Position: server accepts client update if newer (LWW)
    if (delta.position) {
      if (player.lastSyncAt && clientTimestamp && clientTimestamp < player.lastSyncAt.getTime()) {
        conflicts.push('position:client_older');
        // Keep server position (authoritative)
      } else {
        merged.position = delta.position;
      }
    }

    // Rotation: always accept (low impact, high frequency)
    if (typeof delta.rotation === 'number') {
      merged.rotation = delta.rotation;
    }

    // Inventory: merge with $addToSet / $pull (idempotent)
    if (delta.inventory_delta) {
      const { added, removed } = delta.inventory_delta;
      if (added?.length) {
        // Dedupe by itemId before merge
        const uniqueAdds = added.filter((item, idx, arr) => 
          arr.findIndex(i => i.itemId === item.itemId) === idx
        );
        merged.inventory = [...(player.inventory || []), ...uniqueAdds];
      }
      if (removed?.length) {
        merged.inventory = (player.inventory || []).filter(
          item => !removed.includes(item.itemId)
        );
      }
    }

    // Quest progress: merge by questId, prefer newer status
    if (delta.quest_progress) {
      merged.questProgress = { ...(player.questProgress || {}) };
      for (const [questId, progress] of Object.entries(delta.quest_progress)) {
        const existing = merged.questProgress![questId];
        if (!existing || (progress.status !== existing.status)) {
          merged.questProgress![questId] = {
            ...progress,
            updatedAt: new Date(clientTimestamp || serverTime),
          };
        } else {
          conflicts.push(`quest_${questId}:no_change`);
        }
      }
    }

    // Update sync metadata
    merged.lastSyncAt = new Date(clientTimestamp || serverTime);

    // Persist merged state
    await Player.findOneAndUpdate({ playerId }, { $set: merged });

    return {
      success: true,
      merged,
      conflicts,
      serverTimestamp: serverTime,
    };
  }

  /**
   * Batch sync: process multiple deltas atomically
   */
  static async batchSync(
    playerId: string,
    deltas: SyncDelta[]
  ): Promise<SyncResult> {
    if (deltas.length === 0) {
      return { success: true, merged: {}, conflicts: [], serverTimestamp: Date.now() };
    }

    // Sort by timestamp (oldest first) for deterministic merge
    const sorted = [...deltas].sort((a, b) => 
      (a.timestamp || 0) - (b.timestamp || 0)
    );

    let result: SyncResult = { success: true, merged: {}, conflicts: [], serverTimestamp: Date.now() };
    
    for (const delta of sorted) {
      result = await this.mergeSync(playerId, delta, delta.timestamp);
    }
    
    return result;
  }
}