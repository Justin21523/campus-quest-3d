export type QuestStatus =
  | 'locked'
  | 'available'
  | 'active'
  | 'completed'
  | 'failed';

export interface QuestObjective {
  id: string;
  description: string;
  completed: boolean;
}

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  npcId?: string;
  zoneId?: string;
  miniGameId?: string;
  objectives: QuestObjective[];
  rewardItemIds?: string[];
}

export const QUEST_DEFINITIONS: Record<string, QuestDefinition> = {
  q_library_sort: {
    id: 'q_library_sort',
    title: 'Restore the Library Catalog',
    description:
      'Sort the corrupted library records so the archive terminal can come back online.',
    status: 'available',
    npcId: 'alice',
    zoneId: 'library-plaza',
    miniGameId: 'LibrarySortScene',
    objectives: [
      {
        id: 'talk-to-alice',
        description: 'Talk to Alice near the library.',
        completed: false,
      },
      {
        id: 'sort-library-records',
        description: 'Complete the library sorting mini-game.',
        completed: false,
      },
      {
        id: 'collect-access-card',
        description: 'Collect the restored library access card.',
        completed: false,
      },
    ],
    rewardItemIds: ['library_keycard'],
  },
};

export function getQuestById(id: string): QuestDefinition | undefined {
  return QUEST_DEFINITIONS[id];
}

export function getQuestsByNpc(npcId: string): QuestDefinition[] {
  return Object.values(QUEST_DEFINITIONS).filter(
    (quest) => quest.npcId === npcId,
  );
}
