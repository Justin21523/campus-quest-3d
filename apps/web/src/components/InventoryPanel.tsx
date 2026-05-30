// apps/web/src/components/InventoryPanel.tsx
import { useInventoryStore } from '../store/inventoryStore';
import { getItemById } from '@campus-quest/game-data';

export default function InventoryPanel() {
  const { slots, isOpen, toggleInventory, useItem } = useInventoryStore();

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-indigo-500 rounded-xl p-6 w-[500px] max-w-[90vw] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white tracking-wide">🎒 Inventory</h2>
          <button
            onClick={toggleInventory}
            className="text-gray-400 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: 20 }).map((_, i) => {
            const slot = slots[i];
            const item = slot ? getItemById(slot.itemId) : null;
            const usable = item?.type === 'consumable';

            return (
              <div
                key={i}
                onClick={() => usable && slot && useItem(slot.itemId)}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center relative group
                  ${item ? 'border-indigo-500/70 bg-indigo-950/40' : 'border-gray-700 bg-gray-800/50'}
                  ${usable ? 'cursor-pointer hover:border-emerald-400' : 'cursor-default'}
                `}
              >
                {item && (
                  <>
                    <span className="text-2xl">{item.icon}</span>
                    {slot.quantity > 1 && (
                      <span className="absolute bottom-0.5 right-1 text-[10px] text-white font-bold">
                        {slot.quantity}
                      </span>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                      <div className="bg-gray-950 border border-gray-600 rounded px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                        <div className="text-indigo-300 font-bold">{item.name}</div>
                        <div className="text-gray-400 mt-0.5">{item.description}</div>
                        <div className="text-gray-500 mt-0.5 uppercase">{item.type.replace('_', ' ')}</div>
                        {usable && <div className="text-emerald-400 mt-0.5">Click to use</div>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="text-gray-500 text-xs text-center">
          [I] Toggle Inventory • {slots.length}/20 slots used
        </div>
      </div>
    </div>
  );
}
