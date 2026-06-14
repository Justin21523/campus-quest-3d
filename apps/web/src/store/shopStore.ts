// ShopStore: transient UI state for the shop panel (which shop is open) plus
// per-day stock tracking. Stock resets when the day advances (see clockStore).
import { create } from 'zustand';
import { SHOP_DEFINITIONS, type ShopDefinition } from '@campus-quest/game-data';
import { useCurrencyStore } from './currencyStore';
import { useInventoryStore } from './inventoryStore';

export interface ShopStockEntry {
  itemId: string;
  remaining: number; // -1 = unlimited
}

interface ShopState {
  activeShop: ShopDefinition | null;
  /** Per-shop stock overrides keyed by shopId → itemId → remaining. */
  stock: Record<string, Record<string, number>>;
  /** Last day the stock was refreshed. */
  lastRestockDay: number;
  /** Toast message for purchase feedback. */
  purchaseToast: string | null;

  openShop: (shopId: string) => void;
  closeShop: () => void;
  buyItem: (shopId: string, itemId: string, price: number, day: number) => boolean;
  getStock: (shopId: string, itemId: string, defaultStock: number) => number;
  restockIfNeeded: (day: number) => void;
  clearToast: () => void;
}

export const useShopStore = create<ShopState>((set, get) => ({
  activeShop: null,
  stock: {},
  lastRestockDay: 0,
  purchaseToast: null,

  openShop: (shopId) => {
    const def = SHOP_DEFINITIONS[shopId];
    if (def) set({ activeShop: def });
  },

  closeShop: () => set({ activeShop: null }),

  buyItem: (shopId, itemId, price, _day) => {
    const currency = useCurrencyStore.getState();
    const inventory = useInventoryStore.getState();

    if (!currency.spendCoins(price)) {
      set({ purchaseToast: 'Not enough coins!' });
      return false;
    }

    if (!inventory.addItem(itemId, 1)) {
      // Refund if inventory is full
      currency.addCoins(price);
      set({ purchaseToast: 'Inventory full!' });
      return false;
    }

    // Decrement stock
    set((s) => {
      const shopStock = { ...s.stock[shopId] };
      const current = shopStock[itemId] ?? -1;
      if (current > 0) {
        shopStock[itemId] = current - 1;
      }
      return {
        stock: { ...s.stock, [shopId]: shopStock },
        purchaseToast: `Purchased!`,
      };
    });

    return true;
  },

  getStock: (shopId, itemId, defaultStock) => {
    const shopStock = get().stock[shopId];
    if (!shopStock || shopStock[itemId] === undefined) return defaultStock;
    return shopStock[itemId];
  },

  restockIfNeeded: (day) => {
    if (get().lastRestockDay >= day) return;
    // Reset all stock to defaults
    set({ stock: {}, lastRestockDay: day });
  },

  clearToast: () => set({ purchaseToast: null }),
}));
