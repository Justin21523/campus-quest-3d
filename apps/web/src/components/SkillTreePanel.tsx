// SkillTreePanel: shows the three skill branches (Academic, Athletic, Social)
// with their tiered skills. Players spend skill points to unlock passives.
import {
  type SkillBranch,
  SKILL_BRANCH_LABELS,
  SKILL_BRANCH_ICONS,
  getSkillsByBranch,
} from '@campus-quest/game-data';
import { useStatsStore } from '../store/statsStore';

const BRANCHES: SkillBranch[] = ['academic', 'athletic', 'social'];

const BRANCH_COLORS: Record<SkillBranch, { bg: string; border: string; active: string; text: string }> = {
  academic: { bg: 'bg-blue-950/40', border: 'border-blue-600/40', active: 'bg-blue-600', text: 'text-blue-300' },
  athletic: { bg: 'bg-red-950/40', border: 'border-red-600/40', active: 'bg-red-600', text: 'text-red-300' },
  social: { bg: 'bg-emerald-950/40', border: 'border-emerald-600/40', active: 'bg-emerald-600', text: 'text-emerald-300' },
};

interface Props {
  onBack: () => void;
}

export default function SkillTreePanel({ onBack }: Props) {
  const { skillPoints, unlockedSkills, unlockSkill, canUnlockSkill } = useStatsStore();

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-purple-500 rounded-xl p-6 w-[640px] max-w-[95vw] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">🌳 Skill Tree</h2>
            <p className="text-gray-400 text-xs mt-0.5">Spend skill points to unlock passive abilities.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-600/30">
              <span className="text-amber-300 font-bold">{skillPoints}</span>
              <span className="text-amber-400/70 text-sm ml-1">SP</span>
            </div>
            <button
              onClick={onBack}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Branches */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BRANCHES.map((branch) => {
            const skills = getSkillsByBranch(branch);
            const colors = BRANCH_COLORS[branch];

            return (
              <div key={branch} className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
                <h3 className={`${colors.text} font-bold text-center mb-3`}>
                  {SKILL_BRANCH_ICONS[branch]} {SKILL_BRANCH_LABELS[branch]}
                </h3>

                <div className="flex flex-col gap-2">
                  {skills.map((skill) => {
                    const unlocked = unlockedSkills.includes(skill.id);
                    const canUnlock = canUnlockSkill(skill.id);

                    return (
                      <div
                        key={skill.id}
                        className={`p-3 rounded-lg border transition-all
                          ${unlocked
                            ? `${colors.active} border-white/20 text-white`
                            : canUnlock
                              ? 'bg-gray-800/60 border-amber-500/50 hover:border-amber-400 cursor-pointer'
                              : 'bg-gray-800/30 border-gray-700 opacity-60'
                          }
                        `}
                        onClick={() => canUnlock && unlockSkill(skill.id)}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm">{skill.name}</span>
                          <span className={`text-xs ${unlocked ? 'text-white/70' : 'text-gray-400'}`}>
                            Tier {skill.tier}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mb-1">{skill.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Cost: {skill.cost} SP
                          </span>
                          {unlocked && (
                            <span className="text-xs text-emerald-300 font-bold">✓ Unlocked</span>
                          )}
                          {canUnlock && !unlocked && (
                            <span className="text-xs text-amber-300 font-bold animate-pulse">Click to unlock</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-gray-500 text-xs text-center mt-4">
          [Esc] Back to Stats
        </div>
      </div>
    </div>
  );
}
