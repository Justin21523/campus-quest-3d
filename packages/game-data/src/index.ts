export * from './maps/types.js';
export * from './maps/room-templates.js';
export * from './maps/campus-zones.js';
export * from './maps/zone-connections.js';

export {
  QUEST_DEFINITIONS,
  getQuestById,
  getQuestsByNpc,
} from './quests.js';
export {
  ITEM_DEFINITIONS,
  getItemById,
} from './items.js';

export type {
  FurniturePlacement,
  PlacedRoomDefinition,
  RoomDefinition,
  RoomType,
  WallSegment,
  ZoneDefinition,
} from './maps/types.js';
export type {
  ZoneConnection,
} from './maps/zone-connections.js';

export type {
  QuestDefinition,
  QuestObjective,
  QuestStatus,
} from './quests.js';
export type {
  ItemDefinition,
  ItemType,
} from './items.js';
