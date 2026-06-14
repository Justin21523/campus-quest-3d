// Player stats & skill tree definitions. Three stat axes (Academic, Athletic,
// Social) plus Luck. XP is earned from quests, events, exploration, and social
// interactions. Levelling up grants skill points that can be spent on passive
// skills in one of three branches.

export type StatKey = 'academic' | 'athletic' | 'social' | 'luck';

export const STAT_KEYS: StatKey[] = ['academic', 'athletic', 'social', 'luck'];

export const STAT_LABELS: Record<StatKey, string> = {
  academic: 'Academic',
  athletic: 'Athletic',
  social: 'Social',
  luck: 'Luck',
};

export const STAT_ICONS: Record<StatKey, string> = {
  academic: '📚',
  athletic: '🏃',
  social: '💬',
  luck: '🍀',
};

/** XP required per level: level N requires N * 100 XP. */
export function xpForLevel(level: number): number {
  return level * 100;
}

/** Total cumulative XP to reach a given level from 1. */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForLevel(l);
  return total;
}

// --- Skill Tree ---

export type SkillBranch = 'academic' | 'athletic' | 'social';

export const SKILL_BRANCH_LABELS: Record<SkillBranch, string> = {
  academic: 'Academic Path',
  athletic: 'Athletic Path',
  social: 'Social Path',
};

export const SKILL_BRANCH_ICONS: Record<SkillBranch, string> = {
  academic: '📖',
  athletic: '⚡',
  social: '🤝',
};

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  branch: SkillBranch;
  /** Skill tier (1 = first in branch, 2 = requires tier 1, etc.). */
  tier: number;
  /** Cost in skill points. */
  cost: number;
  /** Prerequisite skill ids (must be unlocked first). */
  requires?: string[];
  /** Passive effect applied when unlocked. */
  effect: SkillEffect;
}

export interface SkillEffect {
  /** Bonus stamina regen per second. */
  staminaRegen?: number;
  /** Bonus max stamina. */
  maxStamina?: number;
  /** Multiplier on coin rewards (e.g. 0.1 = +10%). */
  coinBonus?: number;
  /** Multiplier on XP rewards. */
  xpBonus?: number;
  /** Bonus friendship per greet. */
  friendshipBonus?: number;
  /** Bonus movement speed (flat add). */
  speedBonus?: number;
  /** Discount on shop prices (e.g. 0.1 = -10%). */
  shopDiscount?: number;
  /** Extra inventory slots. */
  inventorySlots?: number;
}

export const SKILL_DEFINITIONS: Record<string, SkillDefinition> = {
  // --- Academic Path ---
  speed_reader: {
    id: 'speed_reader',
    name: 'Speed Reader',
    description: 'Quest XP bonus +10%.',
    branch: 'academic',
    tier: 1,
    cost: 1,
    effect: { xpBonus: 0.1 },
  },
  study_habits: {
    id: 'study_habits',
    name: 'Study Habits',
    description: 'Max stamina +20.',
    branch: 'academic',
    tier: 2,
    cost: 2,
    requires: ['speed_reader'],
    effect: { maxStamina: 20 },
  },
  scholarship: {
    id: 'scholarship',
    name: 'Scholarship',
    description: 'Shop discount 10%.',
    branch: 'academic',
    tier: 3,
    cost: 3,
    requires: ['study_habits'],
    effect: { shopDiscount: 0.1 },
  },

  // --- Athletic Path ---
  runner: {
    id: 'runner',
    name: 'Runner',
    description: 'Movement speed +0.5.',
    branch: 'athletic',
    tier: 1,
    cost: 1,
    effect: { speedBonus: 0.5 },
  },
  endurance: {
    id: 'endurance',
    name: 'Endurance',
    description: 'Stamina regen +5/s.',
    branch: 'athletic',
    tier: 2,
    cost: 2,
    requires: ['runner'],
    effect: { staminaRegen: 5 },
  },
  iron_will: {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Max stamina +40.',
    branch: 'athletic',
    tier: 3,
    cost: 3,
    requires: ['endurance'],
    effect: { maxStamina: 40 },
  },

  // --- Social Path ---
  smooth_talker: {
    id: 'smooth_talker',
    name: 'Smooth Talker',
    description: 'Friendship per greet +1.',
    branch: 'social',
    tier: 1,
    cost: 1,
    effect: { friendshipBonus: 1 },
  },
  networker: {
    id: 'networker',
    name: 'Networker',
    description: 'Coin rewards +15%.',
    branch: 'social',
    tier: 2,
    cost: 2,
    requires: ['smooth_talker'],
    effect: { coinBonus: 0.15 },
  },
  influencer: {
    id: 'influencer',
    name: 'Influencer',
    description: 'Extra 5 inventory slots.',
    branch: 'social',
    tier: 3,
    cost: 3,
    requires: ['networker'],
    effect: { inventorySlots: 5 },
  },
};

export function getSkillById(id: string): SkillDefinition | undefined {
  return SKILL_DEFINITIONS[id];
}

export function getSkillsByBranch(branch: SkillBranch): SkillDefinition[] {
  return Object.values(SKILL_DEFINITIONS)
    .filter((s) => s.branch === branch)
    .sort((a, b) => a.tier - b.tier);
}
