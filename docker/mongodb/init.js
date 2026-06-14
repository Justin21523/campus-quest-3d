// docker/mongodb/init.js
// Executed automatically on first MongoDB container startup

db = db.getSiblingDB('campus_quest');

// Player collection indexes
db.players.createIndex(
  { playerId: 1 },
  { unique: true, name: 'idx_playerId_unique' }
);

db.players.createIndex(
  { lastLogin: -1 },
  { name: 'idx_lastLogin_ttl' } // For potential session cleanup queries
);

// Query optimization for active players
db.players.createIndex(
  { currentZone: 1, lastLogin: -1 },
  { name: 'idx_zone_activity' }
);

// Quest progress partial index (only active/failed)
db.players.createIndex(
  { "questProgress.status": 1 },
  { 
    name: 'idx_quest_status_partial',
    partialFilterExpression: { "questProgress.status": { $in: ["active", "failed"] } }
  }
);

// Inventory fast lookup
db.players.createIndex(
  { "inventory.itemId": 1 },
  { name: 'idx_inventory_items', sparse: true }
);

print("✅ MongoDB indexes initialized successfully");