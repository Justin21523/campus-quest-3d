import type { PipelineStage } from 'mongoose';
import { Player } from '../models/Player.model.js';

export type LeaderboardCategory = 'exploration' | 'quests_completed' | 'friendship' | 'collectibles';

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  name?: string;
  score: number;
}

export class LeaderboardService {
  private static getPipeline(category: LeaderboardCategory): PipelineStage[] {
    switch (category) {
      case 'exploration':
        return [
          {
            $addFields: {
              score: { $size: { $ifNull: ['$exploration.discoveredChunks', []] } },
            },
          },
        ];
      case 'quests_completed':
        return [
          {
            $addFields: {
              score: {
                $size: {
                  $filter: {
                    input: { $objectToArray: { $ifNull: ['$questProgress', {}] } },
                    as: 'quest',
                    cond: { $eq: ['$$quest.v.status', 'completed'] },
                  },
                },
              },
            },
          },
        ];
      case 'friendship':
        return [
          {
            $addFields: {
              score: {
                $sum: {
                  $map: {
                    input: { $objectToArray: { $ifNull: ['$friendship', {}] } },
                    as: 'friend',
                    in: { $ifNull: ['$$friend.v.points', 0] },
                  },
                },
              },
            },
          },
        ];
      case 'collectibles':
        return [
          {
            $addFields: {
              score: { $size: { $ifNull: ['$collectibles.collectedIds', []] } },
            },
          },
        ];
      default:
        return [];
    }
  }

  static async getTop(category: LeaderboardCategory, limit = 10, offset = 0): Promise<LeaderboardEntry[]> {
    const pipeline: PipelineStage[] = [
      ...LeaderboardService.getPipeline(category),
      { $match: { score: { $gt: 0 } } },
      { $sort: { score: -1, lastLogin: -1 } },
      { $skip: offset },
      { $limit: limit },
      { $project: { playerId: 1, name: 1, score: 1 } },
    ];

    const raw = await Player.aggregate<Pick<LeaderboardEntry, 'playerId' | 'name' | 'score'>>(pipeline);
    return raw.map((doc, idx) => ({
      rank: offset + idx + 1,
      playerId: doc.playerId,
      name: doc.name,
      score: doc.score || 0,
    }));
  }

  static async getPlayerRank(playerId: string, category: LeaderboardCategory): Promise<number | null> {
    const [playerScore] = await Player.aggregate<{ score: number }>([
      ...LeaderboardService.getPipeline(category),
      { $match: { playerId } },
      { $project: { score: 1 } },
    ]);

    if (!playerScore || playerScore.score <= 0) return null;

    const higherScores = await Player.aggregate<{ count: number }>([
      ...LeaderboardService.getPipeline(category),
      { $match: { score: { $gt: playerScore.score } } },
      { $count: 'count' },
    ]);

    return (higherScores[0]?.count ?? 0) + 1;
  }
}
