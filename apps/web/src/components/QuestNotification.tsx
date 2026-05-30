import { useEffect, useState } from 'react';
import { useQuestStore, type QuestStatus } from '../store/questStore';

export default function QuestNotification() {
  const quests = useQuestStore((s) => s.quests);
  const [notification, setNotification] = useState<{ title: string; type: QuestStatus } | null>(null);

  // Track quest status changes
  useEffect(() => {
    const entries = Object.values(quests);
    const latest = entries[entries.length - 1];
    if (!latest) return;

    // Show notification when quest becomes active or completed
    if (latest.status === 'active' || latest.status === 'completed') {
      const showTimer = setTimeout(() => {
        setNotification({ title: latest.title, type: latest.status });
      }, 0);
      const hideTimer = setTimeout(() => setNotification(null), 3000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [quests]);

  if (!notification) return null;

  const colors = {
    available: 'border-blue-500 text-blue-400',
    active: 'border-yellow-500 text-yellow-400',
    completed: 'border-green-500 text-green-400',
  };

  const labels = {
    available: '📋 New Quest Available',
    active: '⚔️ Quest Started',
    completed: '✅ Quest Completed',
  };

  return (
    <div className="absolute top-20 right-4 z-40 animate-slide-in-right">
      <div className={`bg-gray-900/95 border-2 ${colors[notification.type]} rounded-lg p-4 shadow-xl backdrop-blur-sm max-w-xs`}>
        <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
          {labels[notification.type]}
        </div>
        <div className="text-white font-semibold">{notification.title}</div>
      </div>
    </div>
  );
}
