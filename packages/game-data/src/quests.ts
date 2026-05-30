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

  q_cross_school_exchange: {
    id: 'q_cross_school_exchange',
    title: 'Inter-School Exchange',
    description:
      'Deliver the student council greeting from Starbridge to Riverside High. Take the bus to Riverside and find Hana.',
    status: 'available',
    npcId: 'mei',
    zoneId: 'riverside_outdoor',
    objectives: [
      {
        id: 'accept-from-mei',
        description: 'Accept the exchange errand from Mei at Starbridge.',
        completed: false,
      },
      {
        id: 'travel-to-riverside',
        description: 'Fast-travel to Riverside via a bus stop or the map.',
        completed: false,
      },
      {
        id: 'greet-hana',
        description: 'Find Hana in the Riverside district and deliver the greeting.',
        completed: false,
      },
    ],
    rewardItemIds: ['choco_box'],
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
