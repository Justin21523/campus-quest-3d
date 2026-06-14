// DailyQuestPanel: shows the current day's daily quests with completion status.
// Toggled with the D key.
import { useEffect } from 'react';
import { useDailyQuestStore } from '../store/dailyQuestStore';
import { useClockStore } from '../store/clockStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyQuestPanel({ isOpen, onClose }: Props) {
  const { quests, completedIds, refreshIfNeeded } = useDailyQuestStore();
  const day = useClockStore((s) => s.day);

  useEffect(() => {
    if (isOpen) refreshIfNeeded();
  }, [isOpen, refreshIfNeeded]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const completedCount = completedIds.length;
  const totalCount = quests.length;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-amber-500 rounded-xl p-6 w-[480px] max-w-[90vw] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">📋 Daily Quests</h2>
            <p className="text-gray-400 text-xs mt-0.5">Day {day} • {completedCount}/{totalCount} completed</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all"
              style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* Quest list */}
        <div className="space-y-3 max-h-[350px] overflow-y-auto">
          {quests.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No daily quests available. Advance the day to get new quests!
            </div>
          ) : (
            quests.map((quest) => {
              const done = completedIds.includes(quest.id);
              return (
                <div
                  key={quest.id}
                  className={`p-3 rounded-lg border transition-all
                    ${done
                      ? 'bg-emerald-950/30 border-emerald-600/30 opacity-70'
                      : 'bg-gray-800/60 border-gray-700'
                    }
                  `}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold text-sm ${done ? 'text-emerald-300 line-through' : 'text-white'}`}>
                      {quest.title}
                    </span>
                    {done && <span className="text-emerald-400 text-xs">✓ Done</span>}
                  </div>
                  <p className="text-gray-400 text-xs mb-2">{quest.description}</p>
                  <div className="flex gap-3 text-xs">
                    {quest.rewardCoins && (
                      <span className="text-amber-300">🪙 {quest.rewardCoins}</span>
                    )}
                    {quest.rewardXp && (
                      <span className="text-purple-300">⭐ {quest.rewardXp} XP</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="text-gray-500 text-xs text-center mt-3">
          [D] Toggle Daily Quests • [Esc] Close
        </div>
      </div>
    </div>
  );
}
