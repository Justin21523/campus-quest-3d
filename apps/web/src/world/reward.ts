// apps/web/src/world/reward.ts
// RewardSystem: a single helper that grants gameplay rewards (items, stamina,
// and — in a later batch — stats/XP). Quests, pickups and events route through
// here so reward handling stays in one place.
import { useInventoryStore } from '../store/inventoryStore';
import { useGameStore } from '../store/gameStore';
import { useFriendshipStore } from '../store/friendshipStore';

export interface RewardItem {
  id: string;
  qty?: number;
}

export interface Reward {
  items?: RewardItem[];
  /** Immediate stamina restore. */
  stamina?: number;
  /** Friendship boost for a specific NPC. */
  friendship?: { npcId: string; amount: number };
}

/** Apply a reward to the player's inventory / state. */
export function grantReward(reward: Reward): void {
  if (reward.items?.length) {
    const addItem = useInventoryStore.getState().addItem;
    for (const it of reward.items) addItem(it.id, it.qty ?? 1);
  }
  if (reward.stamina) {
    useGameStore.getState().addStamina(reward.stamina);
  }
  if (reward.friendship) {
    useFriendshipStore.getState().addFriendship(reward.friendship.npcId, reward.friendship.amount);
  }
}
