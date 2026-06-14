// apps/api/src/services/inventoryService.ts
import { Player, type IPlayer } from '../models/Player.model.js';
import { ITEM_DEFINITIONS } from '@campus-quest/game-data';
import type { ItemDefinition } from '@campus-quest/game-data'; // Adjust export if needed

export interface InventoryAction {
  playerId: string;
  action: 'add' | 'remove' | 'consume';
  itemId: string;
  quantity: number;
  timestamp: number;
}

export interface InventoryResult {
  success: boolean;
  updatedInventory: IPlayer['inventory'];
  errors: string[];
  grantedEffects?: { stamina?: number; friendship?: { npcId: string; points: number } };
}

export class InventoryService {
  static async process(action: InventoryAction): Promise<InventoryResult> {
    const errors: string[] = [];
    
    // 1. Validate item definition
    const itemDef = ITEM_DEFINITIONS[action.itemId] as ItemDefinition | undefined;
    if (!itemDef) {
      return { success: false, updatedInventory: [], errors: [`Invalid item ID: ${action.itemId}`] };
    }

    // 2. Validate quantity limits
    if (action.quantity <= 0) {
      errors.push('Quantity must be positive');
    }
    if (itemDef.maxStack && action.quantity > itemDef.maxStack) {
      errors.push(`Exceeds max stack size (${itemDef.maxStack})`);
    }

    // 3. Fetch player document
    const player = await Player.findOne({ playerId: action.playerId }).select('inventory stamina');
    if (!player) {
      return { success: false, updatedInventory: [], errors: ['Player not found'] };
    }

    if (errors.length > 0) {
      return { success: false, updatedInventory: player.inventory || [], errors };
    }

    const currentInv = player.inventory || [];
    let updatedInv = [...currentInv];
    const grantedEffects: InventoryResult['grantedEffects'] = {};

    switch (action.action) {
      case 'add': {
        const existingIdx = updatedInv.findIndex(i => i.itemId === action.itemId);
        if (existingIdx >= 0) {
          // Stack increase
          updatedInv[existingIdx].quantity += action.quantity;
        } else {
          updatedInv.push({ itemId: action.itemId, quantity: action.quantity, acquiredAt: new Date() });
        }
        break;
      }
      case 'remove': {
        const itemIdx = updatedInv.findIndex(i => i.itemId === action.itemId);
        if (itemIdx === -1 || updatedInv[itemIdx].quantity < action.quantity) {
          errors.push('Insufficient item quantity');
          return { success: false, updatedInventory: currentInv, errors };
        }
        updatedInv[itemIdx].quantity -= action.quantity;
        if (updatedInv[itemIdx].quantity === 0) {
          updatedInv.splice(itemIdx, 1);
        }
        break;
      }
      case 'consume': {
        const itemIdx = updatedInv.findIndex(i => i.itemId === action.itemId);
        if (itemIdx === -1 || updatedInv[itemIdx].quantity < action.quantity) {
          errors.push('Insufficient item quantity');
          return { success: false, updatedInventory: currentInv, errors };
        }
        
        // Apply consumable effects
        if (itemDef.type === 'consumable') {
          grantedEffects.stamina = (itemDef.effect?.stamina || 0) * action.quantity;
        }
        
        // Remove from inventory
        updatedInv[itemIdx].quantity -= action.quantity;
        if (updatedInv[itemIdx].quantity === 0) {
          updatedInv.splice(itemIdx, 1);
        }
        break;
      }
    }

    // Atomic update
    await Player.findOneAndUpdate(
      { playerId: action.playerId },
      { $set: { inventory: updatedInv, lastLogin: new Date() } }
    );

    return {
      success: true,
      updatedInventory: updatedInv,
      errors: [],
      grantedEffects: Object.keys(grantedEffects).length > 0 ? grantedEffects : undefined,
    };
  }
}