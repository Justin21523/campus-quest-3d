/**
 * Simple file-based migration runner
 * Usage: tsx src/scripts/migrate.ts [up|down|status]
 * Migrations must be placed in src/migrations/ and export { up, down }
 */

import { connectDB, closeDB } from '../config/db.js';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const MIGRATION_COLLECTION = 'migrations';

interface MigrationRecord {
  version: string;
  appliedAt: Date;
  status: 'applied' | 'rolled_back';
}

async function getAppliedVersions(): Promise<Set<string>> {
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB connection is not initialized');
  const docs = await db.collection(MIGRATION_COLLECTION).find({ status: 'applied' }).toArray();
  return new Set(docs.map(d => d.version));
}

async function runMigration(direction: 'up' | 'down') {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB connection is not initialized');
  const applied = await getAppliedVersions();

  try {
    const files = await fs.readdir(MIGRATIONS_DIR);
    const tsFiles = files
      .filter(f => f.endsWith('.ts') || f.endsWith('.js'))
      .map(f => path.basename(f, path.extname(f)))
      .sort(); // Sort alphabetically (YYYYMMDD_HHMMSS_...)

    for (const version of tsFiles) {
      const shouldRun = direction === 'up' ? !applied.has(version) : applied.has(version);
      if (!shouldRun) continue;

      console.log(`🔄 ${direction.toUpperCase()} migration: ${version}`);
      const mod = await import(path.join(MIGRATIONS_DIR, `${version}.ts`));
      
      try {
        if (mod[direction]) await mod[direction](db);
        await db.collection(MIGRATION_COLLECTION).updateOne(
          { version },
          { $set: { version, appliedAt: new Date(), status: direction === 'up' ? 'applied' : 'rolled_back' } },
          { upsert: true }
        );
        console.log(`✅ Success: ${version}`);
      } catch (err) {
        console.error(`❌ Failed: ${version}`, err);
        process.exit(1);
      }
    }
    console.log(`✨ ${direction} complete.`);
  } finally {
    await closeDB();
  }
}

async function showStatus() {
  await connectDB();
  try {
    const applied = await getAppliedVersions();
    const files = (await fs.readdir(MIGRATIONS_DIR))
      .filter(f => f.endsWith('.ts') || f.endsWith('.js'))
      .map(f => path.basename(f, path.extname(f)))
      .sort();

    console.log('📋 Migration Status:');
    for (const v of files) {
      const status = applied.has(v) ? '✅ APPLIED' : '⏳ PENDING';
      console.log(`  ${v.padEnd(30)} ${status}`);
    }
  } finally {
    await closeDB();
  }
}

// CLI Entry
const command = process.argv[2] || 'status';
if (command === 'up' || command === 'down') {
  runMigration(command as 'up' | 'down');
} else if (command === 'status') {
  showStatus();
} else {
  console.error('Usage: tsx src/scripts/migrate.ts [up|down|status]');
  process.exit(1);
}