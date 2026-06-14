// ShopPanel: full-screen overlay for buying items from a shop. Shows the
// shop's inventory with prices, the player's coin balance, and purchase buttons.
// Styled consistently with InventoryPanel (dark theme, indigo accents).
import { useEffect } from 'react';
import { getItemById } from '@campus-quest/game-data';
import { useShopStore } from '../store/shopStore';
import { useCurrencyStore } from '../store/currencyStore';
import { useClockStore } from '../store/clockStore';

export default function ShopPanel() {
  const activeShop = useShopStore((s) => s.activeShop);
  const buyItem = useShopStore((s) => s.buyItem);
  const closeShop = useShopStore((s) => s.closeShop);
  const getStock = useShopStore((s) => s.getStock);
  const purchaseToast = useShopStore((s) => s.purchaseToast);
  const clearToast = useShopStore((s) => s.clearToast);
  const coins = useCurrencyStore((s) => s.coins);
  const day = useClockStore((s) => s.day);

  useEffect(() => {
    if (!activeShop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeShop();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeShop, closeShop]);

  // Auto-clear purchase toast after 1.5s
  useEffect(() => {
    if (!purchaseToast) return;
    const t = setTimeout(clearToast, 1500);
    return () => clearTimeout(t);
  }, [purchaseToast, clearToast]);

  if (!activeShop) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-amber-500 rounded-xl p-6 w-[540px] max-w-[90vw] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              {activeShop.icon} {activeShop.name}
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">{activeShop.description}</p>
          </div>
          <button
            onClick={closeShop}
            className="text-gray-400 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Coin balance */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-950/40 border border-amber-600/30 rounded-lg">
          <span className="text-lg">🪙</span>
          <span className="text-amber-300 font-bold text-lg">{coins}</span>
          <span className="text-amber-400/70 text-sm">Campus Coins</span>
        </div>

        {/* Item list */}
        <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
          {activeShop.items.map((shopItem) => {
            const item = getItemById(shopItem.itemId);
            if (!item) return null;
            const stock = getStock(activeShop.id, shopItem.itemId, shopItem.stock);
            const canAfford = coins >= shopItem.price;
            const soldOut = stock === 0;

            return (
              <div
                key={shopItem.itemId}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors
                  ${soldOut
                    ? 'border-gray-700 bg-gray-800/30 opacity-50'
                    : canAfford
                      ? 'border-amber-600/40 bg-amber-950/20 hover:bg-amber-900/30'
                      : 'border-gray-700 bg-gray-800/30'
                  }
                `}
              >
                {/* Icon */}
                <span className="text-2xl w-8 text-center">{item.icon}</span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold text-sm">{item.name}</div>
                  <div className="text-gray-400 text-xs truncate">{item.description}</div>
                </div>

                {/* Stock */}
                <div className="text-gray-500 text-xs w-12 text-center">
                  {stock === -1 ? '∞' : `×${stock}`}
                </div>

                {/* Price + Buy */}
                <button
                  onClick={() => !soldOut && canAfford && buyItem(activeShop.id, shopItem.itemId, shopItem.price, day)}
                  disabled={soldOut || !canAfford}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors min-w-[80px]
                    ${soldOut
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : canAfford
                        ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {soldOut ? 'Sold Out' : `🪙 ${shopItem.price}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Purchase toast */}
        {purchaseToast && (
          <div className={`mt-3 text-center text-sm font-bold rounded-lg py-2 px-4
            ${purchaseToast.includes('Purchased')
              ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-600/30'
              : 'bg-red-900/50 text-red-300 border border-red-600/30'
            }
          `}>
            {purchaseToast}
          </div>
        )}

        {/* Footer hint */}
        <div className="text-gray-500 text-xs text-center mt-3">
          [Esc] Close Shop • Stock refreshes daily
        </div>
      </div>
    </div>
  );
}
