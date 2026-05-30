// apps/web/src/data/quests.ts
// Re-export from shared game-data package for backward compatibility
export { QUEST_DEFINITIONS as INITIAL_QUESTS, getQuestById, getQuestsByNpc } from '@campus-quest/game-data';
export type { QuestDefinition, QuestStatus } from '@campus-quest/game-data';
