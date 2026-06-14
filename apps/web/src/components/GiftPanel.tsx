// GiftPanel: UI for giving gifts to NPCs. Shows the player's inventory items
// and lets them select one to give. Displays the NPC's reaction and friendship
// change. Opened from the dialogue box when interacting with an NPC.
import { useEffect } from 'react';
import {
  getItemById,
  getNpcById,
  MAX_GIFTS_PER_PHASE,
  type GiftReaction,
} from '@campus-quest/game-data';
import { useGiftStore } from '../store/giftStore';
import { useInventoryStore } from '../store/inventoryStore';
import { useFriendshipStore } from '../store/friendshipStore';

interface Props {
  isOpen: boolean;
  npcId: string;
  onClose: () => void;
}

const REACTION_EMOJI: Record<GiftReaction, string> = {
  loved: '💖',
  liked: '😊',
  neutral: '😐',
  disliked: '😞',
};

const REACTION_COLOR: Record<GiftReaction, string> = {
  loved: 'text-pink-300 border-pink-500/50 bg-pink-950/40',
  liked: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/40',
  neutral: 'text-gray-300 border-gray-500/50 bg-gray-800/40',
  disliked: 'text-red-300 border-red-500/50 bg-red-950/40',
};

export default function GiftPanel({ isOpen, npcId, onClose }: Props) {
  const { slots } = useInventoryStore();
  const { canGiveGift, giveGift, lastResult, lastGiftNpcId, clearLastResult, giftsThisPhase } = useGiftStore();
  const friendshipPoints = useFriendshipStore((s) => s.points[npcId] ?? 0);
  const npc = getNpcById(npcId);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !npc) return null;

  const canGive = canGiveGift(npcId);
  const isFavorite = (itemId: string) => npc.favoriteItems.includes(itemId);

  const handleGive = (itemId: string) => {
    giveGift(npcId, itemId);
  };

  const handleDismissResult = () => {
    clearLastResult();
  };

  // Show reaction result overlay
  if (lastResult && lastGiftNpcId === npcId) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className={`border-2 rounded-xl p-6 w-[400px] max-w-[90vw] shadow-2xl text-center ${REACTION_COLOR[lastResult.reaction]}`}>
          <div className="text-5xl mb-3">{REACTION_EMOJI[lastResult.reaction]}</div>
          <h3 className="text-lg font-bold mb-2">{npc.name}</h3>
          <p className="text-sm mb-4 italic">"{lastResult.reactionText}"</p>
          <div className="flex justify-center gap-2 mb-4">
            <span className={`text-sm font-bold ${lastResult.friendshipChange >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
              {lastResult.friendshipChange >= 0 ? '+' : ''}{lastResult.friendshipChange} friendship
            </span>
          </div>
          <button
            onClick={handleDismissResult}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border-2 border-pink-500 rounded-xl p-6 w-[480px] max-w-[90vw] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">🎁 Give a Gift</h2>
            <p className="text-gray-400 text-xs mt-0.5">
              To: <span className="text-pink-300">{npc.name}</span> • Friendship: {friendshipPoints} pts
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Gift limit warning */}
        {!canGive && (
          <div className="mb-3 p-2 bg-amber-950/40 border border-amber-600/30 rounded-lg text-amber-300 text-sm text-center">
            You've given {MAX_GIFTS_PER_PHASE} gifts this time period. Come back later!
          </div>
        )}

        {/* Inventory items */}
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {slots.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Your inventory is empty. Find items to give as gifts!
            </div>
          ) : (
            slots.map((slot) => {
              const item = getItemById(slot.itemId);
              if (!item) return null;
              const fav = isFavorite(slot.itemId);

              return (
                <div
                  key={slot.itemId}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all
                    ${canGive
                      ? 'bg-gray-800/60 border-gray-700 hover:border-pink-500/50 cursor-pointer'
                      : 'bg-gray-800/30 border-gray-700 opacity-50'
                    }
                    ${fav ? 'ring-1 ring-pink-500/30' : ''}
                  `}
                  onClick={() => canGive && handleGive(slot.itemId)}
                >
                  <span className="text-2xl">{item.icon || '📦'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{item.name}</span>
                      {fav && (
                        <span className="text-pink-400 text-xs">♥ Favorite</span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs">×{slot.quantity}</span>
                  </div>
                  {canGive && (
                    <button className="px-3 py-1 bg-pink-700 hover:bg-pink-600 text-white rounded text-xs transition-colors">
                      Give
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="text-gray-500 text-xs text-center mt-3">
          ♥ = NPC favorite • [Esc] Close
        </div>
      </div>
    </div>
  );
}
