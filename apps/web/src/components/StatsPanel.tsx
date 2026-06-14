// StatsPanel: shows the player's level, XP bar, base stats, and a button to
// open the skill tree. Toggled with the C key.
import { useEffect } from 'react';
import {
  STAT_KEYS,
  STAT_LABELS,
  STAT_ICONS,
  xpForLevel,
} from '@campus-quest/game-data';
import { useStatsStore } from '../store/statsStore';
import { useState } from 'react';
import SkillTreePanel from './SkillTreePanel';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatsPanel({ isOpen, onClose }: Props) {
  const { stats, xp, level, skillPoints } = useStatsStore();
  const [showSkills, setShowSkills] = useState(false);
  const xpNeeded = xpForLevel(level);
  const xpPct = xpNeeded > 0 ? (xp / xpNeeded) * 100 : 0;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSkills) setShowSkills(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, showSkills]);

  if (!isOpen) return null;

  if (showSkills) {
    return <SkillTreePanel onBack={() => setShowSkills(false)} />;
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-purple-500 rounded-xl p-6 w-[480px] max-w-[90vw] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white tracking-wide">📊 Character Stats</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Level + XP */}
        <div className="mb-5 p-3 bg-purple-950/40 border border-purple-600/30 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-300 font-bold text-lg">Level {level}</span>
            <span className="text-gray-400 text-sm">{xp} / {xpNeeded} XP</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          {skillPoints > 0 && (
            <div className="mt-2 text-amber-300 text-sm font-bold animate-pulse">
              ✨ {skillPoints} skill point{skillPoints > 1 ? 's' : ''} available!
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {STAT_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-lg border border-gray-700"
            >
              <span className="text-2xl">{STAT_ICONS[key]}</span>
              <div className="flex-1">
                <div className="text-gray-400 text-xs uppercase">{STAT_LABELS[key]}</div>
                <div className="text-white font-bold text-lg">{stats[key]}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Skill tree button */}
        <button
          onClick={() => setShowSkills(true)}
          className="w-full py-3 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span>🌳</span>
          <span>Skill Tree</span>
          {skillPoints > 0 && (
            <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
              {skillPoints}
            </span>
          )}
        </button>

        {/* Footer */}
        <div className="text-gray-500 text-xs text-center mt-3">
          [C] Toggle Stats • [Esc] Close
        </div>
      </div>
    </div>
  );
}
