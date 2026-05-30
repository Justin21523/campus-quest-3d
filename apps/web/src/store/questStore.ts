import { create } from 'zustand';
import { getQuestById } from '@campus-quest/game-data';
import { grantReward } from '../world/reward';
import { useFriendshipStore } from './friendshipStore';

export type QuestStatus = 'available' | 'active' | 'completed';

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  miniGameId?: string; // Links to Phaser scene key
  npcGiver?: string;
  rewardItemIds?: string[];
}

interface QuestState {
  quests: Record<string, Quest>;
  activeMiniGame: string | null;

  addQuest: (quest: Quest) => void;
  updateQuestStatus: (id: string, status: QuestStatus) => void;
  openMiniGame: (miniGameId: string) => void;
  closeMiniGame: () => void;
  completeMiniGame: (miniGameId: string) => void;
}

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: {},
  activeMiniGame: null,

  addQuest: (quest) => set((state) => ({
    quests: { ...state.quests, [quest.id]: quest },
  })),

  updateQuestStatus: (id, status) => set((state) => ({
    quests: {
      ...state.quests,
      [id]: { ...state.quests[id], status },
    },
  })),

  openMiniGame: (miniGameId) => set({ activeMiniGame: miniGameId }),

  closeMiniGame: () => set({ activeMiniGame: null }),

  completeMiniGame: (miniGameId) => {
    const { quests, updateQuestStatus } = get();
    // Find quest linked to this mini-game and mark completed
    const questId = Object.keys(quests).find(
      (qid) => quests[qid].miniGameId === miniGameId && quests[qid].status === 'active'
    );
    if (questId) {
      updateQuestStatus(questId, 'completed');
      // Grant quest rewards through the central reward system.
      const questDef = getQuestById(questId);
      if (questDef?.rewardItemIds?.length) {
        grantReward({ items: questDef.rewardItemIds.map((id) => ({ id })) });
      }
      // Completing an NPC's quest is a big friendship boost for that NPC.
      if (questDef?.npcId) {
        useFriendshipStore.getState().addFriendship(questDef.npcId, 25);
      }
    }
    set({ activeMiniGame: null });
  },
}));
