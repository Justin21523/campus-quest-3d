import { useEffect } from 'react';
import { useDialogueStore } from '../store/dialogueStore';
import { useQuestStore } from '../store/questStore';
import { INITIAL_QUESTS } from '../data/quests';

export default function DialogueBox() {
  const {
    isOpen,
    lines,
    currentIndex,
    nextLine,
    closeDialogue,
  } = useDialogueStore();

  const {
    quests,
    addQuest,
    updateQuestStatus,
  } = useQuestStore();

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();

        const isLastLine = currentIndex >= lines.length - 1;
        const currentLine = lines[currentIndex];

        if (!isLastLine) {
          nextLine();
          return;
        }

        closeDialogue();

        const npcQuestId = currentLine?.questId;

        if (npcQuestId) {
          const questEntry = Object.values(INITIAL_QUESTS).find(
            (quest) => quest.id === npcQuestId,
          );

          const existingQuest = quests[npcQuestId];

          if (questEntry && !existingQuest) {
            addQuest({
              ...questEntry,
              status: 'active',
            });
          } else if (existingQuest?.status === 'available') {
            updateQuestStatus(npcQuestId, 'active');
          }
        }

        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeDialogue();
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [
    isOpen,
    lines,
    currentIndex,
    nextLine,
    closeDialogue,
    quests,
    addQuest,
    updateQuestStatus,
  ]);

  if (!isOpen || !lines[currentIndex]) {
    return null;
  }

  const currentLine = lines[currentIndex];

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[700px] max-w-[90vw] z-40">
      <div className="bg-gray-900/95 border-2 border-indigo-500 rounded-xl p-6 shadow-2xl backdrop-blur-sm">
        {/* Speaker Name */}
        <div className="text-indigo-400 font-bold text-lg mb-2 tracking-wide">
          {currentLine.speaker}
        </div>

        {/* Dialogue Text */}
        <p className="text-white text-base leading-relaxed min-h-[3rem]">
          {currentLine.text}
        </p>

        {/* Progress & Hint */}
        <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
          <span>{currentIndex + 1} / {lines.length}</span>
          <span className="animate-pulse">
            {currentIndex < lines.length - 1 ? '[SPACE] Next' : '[SPACE] Close'}
          </span>
        </div>
      </div>
    </div>
  );
}
