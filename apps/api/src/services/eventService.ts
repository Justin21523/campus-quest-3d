// apps/api/src/services/eventService.ts
import { Player } from '../models/Player.model.js';

interface EventReward {
  stamina?: number;
  items?: Array<{ id: string; qty: number }>;
  friendship?: { npcId: string; amount: number };
}

interface EventDefinition {
  id: string;
  reward: EventReward;
}

const EVENT_DEFINITIONS: Record<string, EventDefinition> = {
  ev_lost_wallet: { id: 'ev_lost_wallet', reward: { items: [{ id: 'star_coin', qty: 1 }], friendship: { npcId: 'mei', amount: 5 } } },
  ev_traffic_help: { id: 'ev_traffic_help', reward: { stamina: 20 } },
  ev_library_glitch: { id: 'ev_library_glitch', reward: { items: [{ id: 'data_fragment', qty: 1 }], friendship: { npcId: 'alice', amount: 5 } } },
  ev_club_flyers: { id: 'ev_club_flyers', reward: { items: [{ id: 'club_flyer', qty: 2 }], friendship: { npcId: 'bob', amount: 5 } } },
  ev_campus_rumor: { id: 'ev_campus_rumor', reward: { items: [{ id: 'rumor_note', qty: 1 }] } },
  ev_snack_share: { id: 'ev_snack_share', reward: { items: [{ id: 'energy_drink', qty: 1 }], stamina: 10 } },
};

export interface EventResolution {
  playerId: string;
  eventId: string;
  zoneId: string;
  resolvedAt: number;
}

export class EventService {
  private static readonly EVENT_COOLDOWN_MS = 30_000;

  static async resolve(resolution: EventResolution): Promise<{
    success: boolean;
    reward: EventReward | null;
    errors: string[];
  }> {
    const errors: string[] = [];
    const eventDef = EVENT_DEFINITIONS[resolution.eventId];

    if (!eventDef) {
      return { success: false, reward: null, errors: ['Unknown event ID'] };
    }

    const player = await Player.findOne({ playerId: resolution.playerId }).select('lastEventResolved currentZone');
    if (!player) {
      return { success: false, reward: null, errors: ['Player not found'] };
    }

    if (player.currentZone !== resolution.zoneId) {
      errors.push('Player not in correct zone');
    }

    const lastResolved = player.lastEventResolved?.[resolution.eventId] || 0;
    if (resolution.resolvedAt - lastResolved < EventService.EVENT_COOLDOWN_MS) {
      errors.push('Event on cooldown');
    }

    if (errors.length > 0) {
      return { success: false, reward: null, errors };
    }

    const reward = eventDef.reward;
    await Player.findOneAndUpdate(
      { playerId: resolution.playerId },
      {
        $set: {
          [`lastEventResolved.${resolution.eventId}`]: resolution.resolvedAt,
          lastLogin: new Date(),
        },
        ...(reward.stamina ? { $inc: { stamina: reward.stamina } } : {}),
        ...(reward.items?.length
          ? {
              $push: {
                inventory: {
                  $each: reward.items.map((item) => ({
                    itemId: item.id,
                    quantity: item.qty,
                    acquiredAt: new Date(),
                  })),
                },
              },
            }
          : {}),
      },
    );

    return { success: true, reward, errors: [] };
  }
}
