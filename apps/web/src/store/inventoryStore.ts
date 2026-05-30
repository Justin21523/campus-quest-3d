// apps/web/src/store/inventoryStore.ts
import { create } from 'zustand';
import { getItemById } from '@campus-quest/game-data';

export interface InventorySlot {
  itemId: string;
  quantity: number;
}

interface InventoryState {
  slots: InventorySlot[];
  maxSlots: number;
  isOpen: boolean;

  addItem: (itemId: string, quantity?: number) => boolean;
  removeItem: (itemId: string, quantity?: number) => boolean;
  hasItem: (itemId: string, quantity?: number) => boolean;
  toggleInventory: () => void;
  openInventory: () => void;
  closeInventory: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  slots: [],
  maxSlots: 20,
  isOpen: false,

  addItem: (itemId, quantity = 1) => {
    const def = getItemById(itemId);
    if (!def) {
      console.warn(`Unknown item: ${itemId}`);
      return false;
    }

    const { slots, maxSlots } = get();
    const newSlots = [...slots];

    if (def.stackable) {
      const existing = newSlots.find((s) => s.itemId === itemId);
      if (existing) {
        const max = def.maxStack || 99;
        const canAdd = Math.min(quantity, max - existing.quantity);
        if (canAdd <= 0) return false;
        existing.quantity += canAdd;
        set({ slots: newSlots });
        return true;
      }
    }

    // Non-stackable or no existing stack
    if (newSlots.length >= maxSlots) return false;
    newSlots.push({ itemId, quantity });
    set({ slots: newSlots });
    return true;
  },

  removeItem: (itemId, quantity = 1) => {
    const { slots } = get();
    const idx = slots.findIndex((s) => s.itemId === itemId);
    if (idx === -1) return false;

    const newSlots = [...slots];
    newSlots[idx].quantity -= quantity;
    if (newSlots[idx].quantity <= 0) {
      newSlots.splice(idx, 1);
    }
    set({ slots: newSlots });
    return true;
  },

  hasItem: (itemId, quantity = 1) => {
    const slot = get().slots.find((s) => s.itemId === itemId);
    return slot ? slot.quantity >= quantity : false;
  },

  toggleInventory: () => set((s) => ({ isOpen: !s.isOpen })),
  openInventory: () => set({ isOpen: true }),
  closeInventory: () => set({ isOpen: false }),
}));
