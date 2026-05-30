// apps/web/src/components/QuestTracker.tsx
import { useQuestStore } from '../store/questStore';

export default function QuestTracker() {
  const quests = useQuestStore((s) => s.quests);

  const activeQuests = Object.values(quests).filter((q) => q.status === 'active');
  const completedCount = Object.values(quests).filter((q) => q.status === 'completed').length;

  if (activeQuests.length === 0 && completedCount === 0) return null;

  return (
    <div className="absolute top-4 right-4 w-64 z-20 pointer-events-none">
      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div className="bg-gray-900/80 border border-yellow-500/50 rounded-lg p-3 mb-2 backdrop-blur-sm">
          <h3 className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
            Active Quests
          </h3>
          <ul className="space-y-2">
            {activeQuests.map((quest) => (
              <li key={quest.id}>
                <div className="text-white text-sm font-medium">{quest.title}</div>
                <div className="text-gray-400 text-xs mt-0.5 line-clamp-2">
                  {quest.description}
                </div>
                {quest.miniGameId && (
                  <div className="text-indigo-400 text-[10px] mt-1">
                    🎮 Mini-game available
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completed Summary */}
      {completedCount > 0 && (
        <div className="bg-gray-900/60 border border-green-500/30 rounded-lg p-2 backdrop-blur-sm">
          <div className="text-green-400 text-xs font-medium">
            ✅ {completedCount} quest{completedCount !== 1 ? 's' : ''} completed
          </div>
        </div>
      )}
    </div>
  );
}
