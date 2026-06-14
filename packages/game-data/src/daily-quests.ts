// packages/game-data/src/daily-quests.ts
// Daily quest pool: randomly generated tasks that refresh each in-game day.
// These provide repeatable content and steady progression.

import type { QuestDefinition } from './quests.js';

export interface DailyQuestTemplate {
  id: string;
  titlePrefix: string;
  descriptions: string[];
  rewardCoins: [number, number]; // min, max
  rewardXp: [number, number];
  objectives: { description: string }[];
}

const DAILY_TEMPLATES: DailyQuestTemplate[] = [
  {
    id: 'daily_explore',
    titlePrefix: 'Explorer',
    descriptions: [
      'Visit 3 different zones around campus.',
      'Explore a new area of the campus today.',
      'Take a walk through the school districts.',
    ],
    rewardCoins: [10, 20],
    rewardXp: [20, 40],
    objectives: [{ description: 'Visit 3 different zones.' }],
  },
  {
    id: 'daily_social',
    titlePrefix: 'Social Butterfly',
    descriptions: [
      'Talk to 2 different NPCs today.',
      'Catch up with your classmates.',
      'Make the rounds and greet your friends.',
    ],
    rewardCoins: [10, 15],
    rewardXp: [15, 30],
    objectives: [{ description: 'Talk to 2 different NPCs.' }],
  },
  {
    id: 'daily_collector',
    titlePrefix: 'Collector',
    descriptions: [
      'Collect 2 items from around campus.',
      'Gather useful items for your inventory.',
      'Stock up on supplies today.',
    ],
    rewardCoins: [8, 15],
    rewardXp: [15, 25],
    objectives: [{ description: 'Collect 2 items.' }],
  },
  {
    id: 'daily_shopper',
    titlePrefix: 'Shopper',
    descriptions: [
      'Buy something from any campus shop.',
      'Support the local campus economy.',
      'Treat yourself to something nice.',
    ],
    rewardCoins: [5, 10],
    rewardXp: [10, 20],
    objectives: [{ description: 'Buy 1 item from a shop.' }],
  },
  {
    id: 'daily_gift',
    titlePrefix: 'Gift Giver',
    descriptions: [
      'Give a gift to any NPC.',
      'Show someone you care with a thoughtful gift.',
      'Spread some kindness today.',
    ],
    rewardCoins: [10, 15],
    rewardXp: [20, 30],
    objectives: [{ description: 'Give a gift to any NPC.' }],
  },
];

/** Number of daily quests offered per day. */
export const DAILY_QUEST_COUNT = 3;

/** Seeded random for deterministic daily selection based on day number. */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/** Generate daily quests for a given in-game day. */
export function generateDailyQuests(day: number): QuestDefinition[] {
  const rng = seededRandom(day * 7919); // prime multiplier for variety
  const shuffled = [...DAILY_TEMPLATES].sort(() => rng() - 0.5);
  const selected = shuffled.slice(0, DAILY_QUEST_COUNT);

  return selected.map((template, i) => {
    const coins = Math.floor(rng() * (template.rewardCoins[1] - template.rewardCoins[0])) + template.rewardCoins[0];
    const xp = Math.floor(rng() * (template.rewardXp[1] - template.rewardXp[0])) + template.rewardXp[0];
    const desc = template.descriptions[Math.floor(rng() * template.descriptions.length)];

    return {
      id: `daily_${day}_${i}`,
      title: `Daily: ${template.titlePrefix}`,
      description: desc,
      status: 'available' as const,
      objectives: template.objectives.map((o) => ({
        id: `daily_${day}_${i}_obj`,
        description: o.description,
        completed: false,
      })),
      rewardCoins: coins,
      rewardXp: xp,
    };
  });
}
