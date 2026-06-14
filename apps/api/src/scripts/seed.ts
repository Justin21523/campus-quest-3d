/**
 * Development seed script
 * Usage: npm run seed -- --reset --player=test_001
 */

import { connectDB, closeDB } from '../config/db.js';
import { Player, type IPlayer } from '../models/Player.model.js';
import { QUEST_DEFINITIONS, ITEM_DEFINITIONS, NPC_DEFINITIONS } from '@campus-quest/game-data';
import type { Vector3 } from '@campus-quest/shared-types';

interface SeedOptions {
  reset: boolean;
  playerId: string;
  playerName: string;
  startingZone: string;
}

const DEFAULT_OPTIONS: SeedOptions = {
  reset: false,
  playerId: 'seed_player_001',
  playerName: 'SeedStudent',
  startingZone: 'main_building_1f',
};

function parseArgs(): SeedOptions {
  const args = process.argv.slice(2);
  const opts = { ...DEFAULT_OPTIONS };
  
  for (const arg of args) {
    if (arg === '--reset') opts.reset = true;
    if (arg.startsWith('--player=')) opts.playerId = arg.split('=')[1];
    if (arg.startsWith('--name=')) opts.playerName = arg.split('=')[1];
    if (arg.startsWith('--zone=')) opts.startingZone = arg.split('=')[1];
  }
  
  return opts;
}

async function seedPlayer(opts: SeedOptions): Promise<IPlayer> {
  // Check if player exists
  const existing = await Player.findOne({ playerId: opts.playerId });
  
  if (opts.reset && existing) {
    console.log(`🗑️  Deleting existing player: ${opts.playerId}`);
    await Player.deleteOne({ playerId: opts.playerId });
  }
  
  if (existing && !opts.reset) {
    console.log(`ℹ️  Player ${opts.playerId} already exists, skipping creation`);
    return existing;
  }
  
  // Create new player with starter items and quests
  const starterItems = ['key_001', 'potion_small_001'];
  const starterQuests = ['q_library_sort'];
  
  const playerData: Partial<IPlayer> = {
    playerId: opts.playerId,
    name: opts.playerName,
    position: { x: 0, y: 0, z: 0 } as Vector3,
    rotation: 0,
    currentZone: opts.startingZone,
    inventory: starterItems.map(itemId => ({
      itemId,
      quantity: 1,
      acquiredAt: new Date(),
    })),
    questProgress: {},
    friendship: {},
    level: 1,
    lastLogin: new Date(),
  };
  
  // Initialize starter quests
  for (const questId of starterQuests) {
    if (QUEST_DEFINITIONS[questId]) {
      playerData.questProgress![questId] = {
        status: 'active',
        objectiveIndex: 0,
        startedAt: new Date(),
      };
    }
  }
  
  // Initialize friendship with starter NPCs
  const starterNpcs = ['alice', 'bob'];
  for (const npcId of starterNpcs) {
    if (NPC_DEFINITIONS[npcId]) {
      playerData.friendship![npcId] = {
        points: 10,
        lastGreeted: { morning: null, afternoon: null, evening: null },
      };
    }
  }
  
  const player = await Player.create(playerData);
  console.log(`✅ Created player: ${opts.playerId} in zone ${opts.startingZone}`);
  return player;
}

async function seedAll(opts: SeedOptions): Promise<void> {
  console.log('🌱 Starting seed process...');
  
  await connectDB();
  
  try {
    if (opts.reset) {
      console.log('🔄 Resetting database...');
      // Optional: clear all players (be careful!)
      // await Player.deleteMany({});
    }
    
    await seedPlayer(opts);
    
    // Log available quests for reference
    console.log('\n📋 Available quests:');
    Object.entries(QUEST_DEFINITIONS).slice(0, 5).forEach(([id, def]) => {
      console.log(`  - ${id}: ${def.title} (${def.zoneId})`);
    });
    
    console.log('\n🎒 Starter items:');
    ['key_001', 'potion_small_001'].forEach(id => {
      const item = ITEM_DEFINITIONS[id];
      console.log(`  - ${id}: ${item?.name} (${item?.type})`);
    });
    
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await closeDB();
  }
  
  console.log('✨ Seed complete!');
}

// Run if executed directly
if (require.main === module) {
  const opts = parseArgs();
  seedAll(opts).catch(console.error);
}

export { seedPlayer, seedAll, SeedOptions };