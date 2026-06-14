// packages/game-data/src/storyline.ts
// Main storyline quest chain: "The Missing Semester"
// A multi-chapter mystery about why an entire semester vanished from school records.
// Players investigate across all three school districts to uncover the truth.

import type { QuestDefinition } from './quests.js';

/** Main storyline quests — unlocked sequentially. */
export const MAIN_STORYLINE_QUESTS: Record<string, QuestDefinition> = {
  // Chapter 1: The Discovery
  q_story_ch1_rumor: {
    id: 'q_story_ch1_rumor',
    title: 'Ch.1: The Rumor',
    description:
      'You overhear students whispering about a "missing semester" — an entire term that vanished from school records. Investigate the rumor by talking to classmates.',
    status: 'available',
    npcId: 'mei',
    zoneId: 'campus_outdoor',
    objectives: [
      { id: 'talk-mei-rumor', description: 'Talk to Mei about the strange rumors.', completed: false },
      { id: 'find-rumor-note', description: 'Find a rumor note around campus.', completed: false },
      { id: 'return-to-mei', description: 'Return to Mei with what you found.', completed: false },
    ],
    rewardCoins: 30,
    rewardXp: 80,
  },

  q_story_ch1_library: {
    id: 'q_story_ch1_library',
    title: 'Ch.1: The Archive Gap',
    description:
      'Alice noticed that library checkout records for the missing semester are completely blank. Help her investigate the restricted section.',
    status: 'locked',
    npcId: 'alice',
    zoneId: 'library_building',
    objectives: [
      { id: 'talk-alice-archive', description: 'Talk to Alice about the archive gap.', completed: false },
      { id: 'search-restricted', description: 'Search the restricted section for clues.', completed: false },
      { id: 'find-data-fragment', description: 'Find a corrupted data fragment.', completed: false },
    ],
    rewardItemIds: ['data_fragment'],
    rewardCoins: 40,
    rewardXp: 100,
  },

  // Chapter 2: The Investigation
  q_story_ch2_analysis: {
    id: 'q_story_ch2_analysis',
    title: 'Ch.2: Data Analysis',
    description:
      'Mr. Sato believes the corrupted data fragment holds clues. Bring it to the Science Hall for analysis.',
    status: 'locked',
    npcId: 'sato',
    zoneId: 'academic_building',
    miniGameId: 'ExamQuizScene',
    objectives: [
      { id: 'bring-fragment-sato', description: 'Bring the data fragment to Mr. Sato.', completed: false },
      { id: 'pass-analysis', description: 'Pass the analysis exam to decode the data.', completed: false },
      { id: 'collect-report', description: 'Collect the decoded report.', completed: false },
    ],
    rewardCoins: 50,
    rewardXp: 130,
  },

  q_story_ch2_cross_school: {
    id: 'q_story_ch2_cross_school',
    title: 'Ch.2: Cross-School Connection',
    description:
      'The decoded data mentions Riverside High. Travel there and ask Hana if they have similar records gaps.',
    status: 'locked',
    npcId: 'hana',
    zoneId: 'riverside_outdoor',
    objectives: [
      { id: 'travel-riverside-ch2', description: 'Travel to Riverside High.', completed: false },
      { id: 'talk-hana-records', description: 'Ask Hana about missing records at Riverside.', completed: false },
      { id: 'find-riverside-clue', description: 'Find the matching record gap at Riverside.', completed: false },
    ],
    rewardCoins: 45,
    rewardXp: 120,
  },

  // Chapter 3: The Truth
  q_story_ch3_northhill: {
    id: 'q_story_ch3_northhill',
    title: 'Ch.3: Northhill\'s Secret',
    description:
      'Mr. Kenji at Northhill has been researching the same phenomenon. Visit him to piece together the full picture.',
    status: 'locked',
    npcId: 'kenji',
    zoneId: 'northhill_outdoor',
    objectives: [
      { id: 'travel-northhill-ch3', description: 'Travel to Northhill Science.', completed: false },
      { id: 'talk-kenji-research', description: 'Discuss the research with Mr. Kenji.', completed: false },
      { id: 'combine-data', description: 'Combine data from all three schools.', completed: false },
    ],
    rewardCoins: 60,
    rewardXp: 150,
  },

  q_story_ch3_finale: {
    id: 'q_story_ch3_finale',
    title: 'Ch.3: The Missing Semester',
    description:
      'All clues point to a single explanation. Return to Starbridge and present your findings to Alice and Mei.',
    status: 'locked',
    npcId: 'alice',
    zoneId: 'library_building',
    miniGameId: 'LibrarySortScene',
    objectives: [
      { id: 'return-starbridge', description: 'Return to Starbridge Library.', completed: false },
      { id: 'present-findings', description: 'Present your findings to Alice and Mei.', completed: false },
      { id: 'restore-records', description: 'Restore the missing semester records.', completed: false },
    ],
    rewardItemIds: ['campus_map'],
    rewardCoins: 100,
    rewardXp: 250,
  },
};

/** Ordered list of main quest IDs for progression tracking. */
export const MAIN_STORYLINE_ORDER = [
  'q_story_ch1_rumor',
  'q_story_ch1_library',
  'q_story_ch2_analysis',
  'q_story_ch2_cross_school',
  'q_story_ch3_northhill',
  'q_story_ch3_finale',
];

/** Get the next main quest after completing the given one. */
export function getNextMainQuest(completedQuestId: string): QuestDefinition | undefined {
  const idx = MAIN_STORYLINE_ORDER.indexOf(completedQuestId);
  if (idx < 0 || idx >= MAIN_STORYLINE_ORDER.length - 1) return undefined;
  return MAIN_STORYLINE_QUESTS[MAIN_STORYLINE_ORDER[idx + 1]];
}

/** Check if a quest ID is part of the main storyline. */
export function isMainStorylineQuest(questId: string): boolean {
  return questId in MAIN_STORYLINE_QUESTS;
}
