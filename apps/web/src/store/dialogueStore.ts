import { create } from 'zustand';

export interface DialogueLine {
  speaker: string;
  text: string;
  questId?: string;
}

interface DialogueState {
  isOpen: boolean;
  npcName: string | null;
  lines: DialogueLine[];
  currentIndex: number;

  openDialogue: (npcName: string, lines: DialogueLine[]) => void;
  nextLine: () => void;
  closeDialogue: () => void;
}

export const useDialogueStore = create<DialogueState>((set, get) => ({
  isOpen: false,
  npcName: null,
  lines: [],
  currentIndex: 0,

  openDialogue: (npcName, lines) => set({
    isOpen: true,
    npcName,
    lines,
    currentIndex: 0,
  }),

  nextLine: () => {
    const { currentIndex, lines, closeDialogue } = get();
    if (currentIndex < lines.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    } else {
      closeDialogue();
    }
  },

  closeDialogue: () => set({
    isOpen: false,
    npcName: null,
    lines: [],
    currentIndex: 0,
  }),
}));
