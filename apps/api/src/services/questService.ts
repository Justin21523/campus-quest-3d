// apps/api/src/services/questService.ts
import { createHmac } from 'node:crypto';
import { Player, type IPlayer } from '../models/Player.model.js';
import { QUEST_DEFINITIONS, type QuestDefinition } from '@campus-quest/game-data';
import type { QuestStatus } from '@campus-quest/shared-types';

export interface QuestTransition {
  questId: string;
  fromStatus: QuestStatus;
  toStatus: QuestStatus;
  objectiveIndex?: number;
  clientSignature?: string;
  timestamp: number;
}

export interface QuestResult {
  success: boolean;
  updatedQuest: {
    questId: string;
    status: QuestStatus;
    objectiveIndex?: number;
    completedAt?: number;
  };
  rewardsGranted: {
    items?: string[];
    stamina?: number;
    friendship?: { npcId: string; points: number };
  };
  achievementsUnlocked: string[];
  errors: string[];
}

export class QuestService {
  static async transition(playerId: string, transition: QuestTransition): Promise<QuestResult> {
    const player = await Player.findOne({ playerId });
    if (!player) {
      return this.failure(transition.questId, 'available', ['Player not found']);
    }

    const questDef = QUEST_DEFINITIONS[transition.questId];
    if (!questDef) {
      return this.failure(transition.questId, 'available', [`Unknown quest: ${transition.questId}`]);
    }

    const errors: string[] = [];
    const currentQuest = player.questProgress?.[transition.questId];

    if (!this.isValidTransition(currentQuest?.status, transition.fromStatus, transition.toStatus)) {
      errors.push(`Invalid transition: ${currentQuest?.status} -> ${transition.toStatus}`);
    }

    if (transition.toStatus === 'active' && !this.checkPrerequisites(player, questDef)) {
      errors.push('Prerequisites not met');
    }

    if (process.env.NODE_ENV === 'production' && transition.clientSignature) {
      const expectedSig = this.computeTransitionSignature(transition);
      if (transition.clientSignature !== expectedSig) {
        errors.push('Signature verification failed');
      }
    }

    if (errors.length > 0) {
      return this.failure(transition.questId, currentQuest?.status || 'available', errors);
    }

    const completedAt = transition.toStatus === 'completed' ? transition.timestamp : undefined;
    const persistedQuest = {
      questId: transition.questId,
      status: transition.toStatus,
      objectiveIndex: transition.objectiveIndex,
      updatedAt: new Date(transition.timestamp),
      completedAt: completedAt ? new Date(completedAt) : undefined,
    };

    const rewardsGranted: QuestResult['rewardsGranted'] =
      transition.toStatus === 'completed' && questDef.rewardItemIds?.length
        ? { items: questDef.rewardItemIds }
        : {};
    const achievementsUnlocked = transition.toStatus === 'completed' ? this.checkAchievements(player) : [];

    await Player.findOneAndUpdate(
      { playerId },
      {
        $set: {
          [`questProgress.${transition.questId}`]: persistedQuest,
          lastLogin: new Date(),
        },
      },
    );

    return {
      success: true,
      updatedQuest: {
        questId: transition.questId,
        status: transition.toStatus,
        objectiveIndex: transition.objectiveIndex,
        completedAt,
      },
      rewardsGranted,
      achievementsUnlocked,
      errors: [],
    };
  }

  private static failure(questId: string, status: QuestStatus, errors: string[]): QuestResult {
    return {
      success: false,
      updatedQuest: { questId, status },
      rewardsGranted: {},
      achievementsUnlocked: [],
      errors,
    };
  }

  private static isValidTransition(
    current: QuestStatus | undefined,
    expected: QuestStatus,
    target: QuestStatus,
  ): boolean {
    const validTransitions: Record<QuestStatus, QuestStatus[]> = {
      locked: ['available'],
      available: ['active', 'failed'],
      active: ['completed', 'failed'],
      completed: [],
      failed: ['active'],
    };

    return current === expected && validTransitions[expected]?.includes(target);
  }

  private static checkPrerequisites(player: IPlayer, questDef: QuestDefinition): boolean {
    if (questDef.rewardItemIds?.length) {
      const ownedItems = new Set(player.inventory?.map((item) => item.itemId) || []);
      return questDef.rewardItemIds.every((id) => !ownedItems.has(id));
    }

    return true;
  }

  private static computeTransitionSignature(t: QuestTransition): string {
    if (!process.env.QUEST_HMAC_SECRET) return '';

    const payload = `${t.questId}:${t.fromStatus}:${t.toStatus}:${t.objectiveIndex ?? ''}:${t.timestamp}`;
    return createHmac('sha256', process.env.QUEST_HMAC_SECRET)
      .update(payload)
      .digest('hex')
      .substring(0, 16);
  }

  private static checkAchievements(player: IPlayer): string[] {
    const completedCount = Object.values(player.questProgress || {}).filter(
      (quest) => quest.status === 'completed',
    ).length;

    return completedCount === 1 ? ['first_steps'] : [];
  }

  static async getAvailableQuests(playerId: string): Promise<QuestDefinition[]> {
    const player = await Player.findOne({ playerId }).select('questProgress inventory');
    if (!player) return [];

    return Object.values(QUEST_DEFINITIONS).filter((quest) => {
      const progress = player.questProgress?.[quest.id];
      if (progress && progress.status !== 'failed') return false;
      return this.checkPrerequisites(player, quest);
    });
  }
}
