// CurrencyStore: tracks the player's Campus Coin balance. Persisted to
// localStorage so coins survive a refresh. Coins are earned from quests,
// random events, and part-time jobs; spent at shops.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CurrencyState {
  coins: number;

  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  canAfford: (amount: number) => boolean;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      coins: 50, // Starting bonus

      addCoins: (amount) =>
        set((s) => ({ coins: s.coins + Math.max(0, amount) })),

      spendCoins: (amount) => {
        if (amount <= 0) return true;
        const { coins } = get();
        if (coins < amount) return false;
        set({ coins: coins - amount });
        return true;
      },

      canAfford: (amount) => get().coins >= amount,
    }),
    { name: 'cq-currency', partialize: (s) => ({ coins: s.coins }) },
  ),
);
