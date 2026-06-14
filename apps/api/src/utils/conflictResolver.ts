// apps/api/src/utils/conflictResolver.ts
/**
 * Conflict Resolution Utilities (CRDT-inspired)
 * Pure functions, no side effects, testable
 */

export type ConflictStrategy = 'lww' | 'merge' | 'server-wins' | 'client-wins';

export interface Versioned<T> {
  value: T;
  timestamp: number;
  nodeId: string; // client/server identifier
}

/**
 * Last-Write-Wins resolver
 */
export function resolveLWW<T>(
  a: Versioned<T>,
  b: Versioned<T>
): Versioned<T> {
  return a.timestamp >= b.timestamp ? a : b;
}

/**
 * Merge resolver for arrays (idempotent union)
 */
export function resolveArrayMerge<T extends { id: string }>(
  a: Versioned<T[]>,
  b: Versioned<T[]>
): Versioned<T[]> {
  const merged = new Map<string, T>();
  
  for (const item of [...a.value, ...b.value]) {
    merged.set(item.id, item);
  }
  
  return {
    value: Array.from(merged.values()),
    timestamp: Math.max(a.timestamp, b.timestamp),
    nodeId: 'merged',
  };
}

/**
 * Merge resolver for records (key-value maps)
 * Strategy per key: lww / server-wins / client-wins
 */
export function resolveRecordMerge<T>(
  a: Versioned<Record<string, T>>,
  b: Versioned<Record<string, T>>,
  strategy: ConflictStrategy = 'lww',
  serverNodeId: string
): Versioned<Record<string, T>> {
  const result: Record<string, T> = { ...a.value };
  
  for (const [key, bVal] of Object.entries(b.value)) {
    const aVal = result[key];
    
    if (aVal === undefined) {
      result[key] = bVal;
      continue;
    }
    
    switch (strategy) {
      case 'lww':
        // Assume T has timestamp field or use external version
        result[key] = bVal; // simplified: prefer b
        break;
      case 'server-wins':
        result[key] = a.nodeId === serverNodeId ? aVal : bVal;
        break;
      case 'client-wins':
        result[key] = a.nodeId !== serverNodeId ? aVal : bVal;
        break;
      case 'merge':
        // Deep merge if T is object, else prefer b
        if (typeof aVal === 'object' && typeof bVal === 'object') {
          result[key] = { ...aVal as object, ...bVal as object } as T;
        } else {
          result[key] = bVal;
        }
        break;
    }
  }
  
  return {
    value: result,
    timestamp: Math.max(a.timestamp, b.timestamp),
    nodeId: 'merged',
  };
}

/**
 * Generate vector clock increment
 */
export function incrementVectorClock(
  clock: Record<string, number>,
  nodeId: string
): Record<string, number> {
  return {
    ...clock,
    [nodeId]: (clock[nodeId] || 0) + 1,
  };
}

/**
 * Check if vector clock a dominates b (a >= b for all nodes)
 */
export function dominates(a: Record<string, number>, b: Record<string, number>): boolean {
  const allNodes = new Set([...Object.keys(a), ...Object.keys(b)]);
  let atLeastOneGreater = false;
  
  for (const node of allNodes) {
    const aVal = a[node] || 0;
    const bVal = b[node] || 0;
    if (aVal < bVal) return false;
    if (aVal > bVal) atLeastOneGreater = true;
  }
  
  return atLeastOneGreater; // true = a is newer, false = concurrent
}