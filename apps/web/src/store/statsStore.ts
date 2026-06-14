// StatsStore: player attributes (academic, athletic, social, luck), XP, level,
// and skill tree. Persisted to localStorage. XP is earned from quests, events,
// and exploration. Levelling up grants skill points for the skill tree.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type StatKey,
  type SkillEffect,
  SKILL_DEFINITIONS,
  xpForLevel,
} from '@campus-quest/game-data';

export interface PlayerStats {
  academic: number;
  athletic: number;
  social: number;
  luck: number;
}

interface StatsState {
  stats: PlayerStats;
  xp: number;
  level: number;
  skillPoints: number;
  unlockedSkills: string[];

  /** Add XP; auto-levels up and grants skill points. */
  addXp: (amount: number) => { leveledUp: boolean; newLevel: number };
  /** Increase a specific stat. */
  addStat: (stat: StatKey, amount: number) => void;
  /** Spend a skill point to unlock a skill. */
  unlockSkill: (skillId: string) => boolean;
  /** Check if a skill can be unlocked. */
  canUnlockSkill: (skillId: string) => boolean;
  /** Aggregate all passive effects from unlocked skills. */
  getActiveEffects: () => SkillEffect;
}

const DEFAULT_STATS: PlayerStats = {
  academic: 5,
  athletic: 5,
  social: 5,
  luck: 3,
};

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      stats: { ...DEFAULT_STATS },
      xp: 0,
      level: 1,
      skillPoints: 0,
      unlockedSkills: [],

      addXp: (amount) => {
        if (amount <= 0) return { leveledUp: false, newLevel: get().level };

        // Apply XP bonus from skills
        const effects = get().getActiveEffects();
        const bonus = effects.xpBonus ?? 0;
        const totalXp = Math.round(amount * (1 + bonus));

        let { xp, level, skillPoints } = get();
        xp += totalXp;
        let leveledUp = false;

        while (xp >= xpForLevel(level)) {
          xp -= xpForLevel(level);
          level += 1;
          skillPoints += 1;
          leveledUp = true;
        }

        set({ xp, level, skillPoints });
        return { leveledUp, newLevel: level };
      },

      addStat: (stat, amount) =>
        set((s) => ({
          stats: { ...s.stats, [stat]: Math.max(0, s.stats[stat] + amount) },
        })),

      unlockSkill: (skillId) => {
        const def = SKILL_DEFINITIONS[skillId];
        if (!def) return false;
        if (!get().canUnlockSkill(skillId)) return false;

        set((s) => ({
          skillPoints: s.skillPoints - def.cost,
          unlockedSkills: [...s.unlockedSkills, skillId],
        }));
        return true;
      },

      canUnlockSkill: (skillId) => {
        const def = SKILL_DEFINITIONS[skillId];
        if (!def) return false;
        const { skillPoints, unlockedSkills } = get();
        if (skillPoints < def.cost) return false;
        if (unlockedSkills.includes(skillId)) return false;
        if (def.requires?.some((r) => !unlockedSkills.includes(r))) return false;
        return true;
      },

      getActiveEffects: () => {
        const { unlockedSkills } = get();
        const merged: SkillEffect = {};
        for (const id of unlockedSkills) {
          const def = SKILL_DEFINITIONS[id];
          if (!def) continue;
          const e = def.effect;
          if (e.staminaRegen) merged.staminaRegen = (merged.staminaRegen ?? 0) + e.staminaRegen;
          if (e.maxStamina) merged.maxStamina = (merged.maxStamina ?? 0) + e.maxStamina;
          if (e.coinBonus) merged.coinBonus = (merged.coinBonus ?? 0) + e.coinBonus;
          if (e.xpBonus) merged.xpBonus = (merged.xpBonus ?? 0) + e.xpBonus;
          if (e.friendshipBonus) merged.friendshipBonus = (merged.friendshipBonus ?? 0) + e.friendshipBonus;
          if (e.speedBonus) merged.speedBonus = (merged.speedBonus ?? 0) + e.speedBonus;
          if (e.shopDiscount) merged.shopDiscount = (merged.shopDiscount ?? 0) + e.shopDiscount;
          if (e.inventorySlots) merged.inventorySlots = (merged.inventorySlots ?? 0) + e.inventorySlots;
        }
        return merged;
      },
    }),
    {
      name: 'cq-stats',
      partialize: (s) => ({
        stats: s.stats,
        xp: s.xp,
        level: s.level,
        skillPoints: s.skillPoints,
        unlockedSkills: s.unlockedSkills,
      }),
    },
  ),
);
