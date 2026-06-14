// apps/web/src/store/dailyQuestStore.ts
// DailyQuestStore: generates and tracks daily quests based on the in-game day.
// Quests refresh when the day changes. Persisted to localStorage.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateDailyQuests, type QuestDefinition } from '@campus-quest/game-data';
import { useClockStore } from './clockStore';
import { grantReward } from '../world/reward';

interface DailyQuestState {
  /** Current day's quests. */
  quests: QuestDefinition[];
  /** Day number these quests were generated for. */
  generatedDay: number;
  /** IDs of completed daily quests today. */
  completedIds: string[];

  /** Refresh quests if the day has changed. Call on phase advance. */
  refreshIfNeeded: () => void;
  /** Mark a daily quest as completed and grant rewards. */
  completeDailyQuest: (questId: string) => void;
  /** Get remaining (uncompleted) daily quests. */
  getRemaining: () => QuestDefinition[];
}

export const useDailyQuestStore = create<DailyQuestState>()(
  persist(
    (set, get) => ({
      quests: [],
      generatedDay: 0,
      completedIds: [],

      refreshIfNeeded: () => {
        const currentDay = useClockStore.getState().day;
        const { generatedDay } = get();
        if (currentDay !== generatedDay) {
          const newQuests = generateDailyQuests(currentDay);
          set({
            quests: newQuests,
            generatedDay: currentDay,
            completedIds: [],
          });
        }
      },

      completeDailyQuest: (questId) => {
        const { quests, completedIds } = get();
        if (completedIds.includes(questId)) return;

        const quest = quests.find((q) => q.id === questId);
        if (!quest) return;

        grantReward({
          coins: quest.rewardCoins,
          xp: quest.rewardXp,
          items: quest.rewardItemIds?.map((id) => ({ id })),
        });

        set({ completedIds: [...completedIds, questId] });
      },

      getRemaining: () => {
        const { quests, completedIds } = get();
        return quests.filter((q) => !completedIds.includes(q.id));
      },
    }),
    { name: 'cq-daily-quests' },
  ),
);
