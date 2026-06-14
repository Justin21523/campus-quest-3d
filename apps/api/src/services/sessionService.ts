// apps/api/src/services/sessionService.ts
import type { SyncDelta } from './playerSyncService.js';

export interface PlayerSession {
  playerId: string;
  status: 'active' | 'idle' | 'offline';
  lastHeartbeat: number;
  currentZone: string;
  syncBuffer: SyncDelta[]; // Offline sync queue
  connectionMeta?: { ip: string; userAgent: string };
}

export class SessionService {
  private static sessions = new Map<string, PlayerSession>();
  private static readonly IDLE_THRESHOLD = 60_000;   // 1 min
  private static readonly OFFLINE_THRESHOLD = 300_000; // 5 mins
  private static readonly BUFFER_MAX_SIZE = 20;

  static init(): void {
    // Periodic session state update
    setInterval(() => SessionService.evaluateSessions(), 15_000);
  }

  static register(playerId: string, meta?: { ip?: string; userAgent?: string }): PlayerSession {
    const session: PlayerSession = {
      playerId,
      status: 'active',
      lastHeartbeat: Date.now(),
      currentZone: 'unknown',
      syncBuffer: [],
      connectionMeta: meta ? { ip: meta.ip ?? '', userAgent: meta.userAgent ?? '' } : undefined,
    };
    SessionService.sessions.set(playerId, session);
    return session;
  }

  static heartbeat(playerId: string, zone?: string): void {
    const session = SessionService.sessions.get(playerId);
    if (!session) {
      // Auto-register on first heartbeat
      SessionService.register(playerId);
      return;
    }
    session.lastHeartbeat = Date.now();
    if (session.status !== 'active') session.status = 'active';
    if (zone) session.currentZone = zone;
  }

  /**
   * Buffer sync delta if player is offline, otherwise return immediately
   */
  static pushSync(playerId: string, delta: SyncDelta): void {
    const session = SessionService.sessions.get(playerId);
    if (!session || session.status === 'offline') {
      // Buffer for later replay
      const existing = SessionService.sessions.get(playerId) || SessionService.register(playerId);
      existing.syncBuffer.push(delta);
      if (existing.syncBuffer.length > SessionService.BUFFER_MAX_SIZE) {
        existing.syncBuffer.shift(); // Drop oldest
      }
    }
  }

  static drainBuffer(playerId: string): SyncDelta[] {
    const session = SessionService.sessions.get(playerId);
    if (!session) return [];
    const buffer = [...session.syncBuffer];
    session.syncBuffer = [];
    return buffer;
  }

  static getSession(playerId: string): PlayerSession | undefined {
    return SessionService.sessions.get(playerId);
  }

  private static evaluateSessions(): void {
    const now = Date.now();
    for (const [id, session] of SessionService.sessions.entries()) {
      const elapsed = now - session.lastHeartbeat;
      if (elapsed > SessionService.OFFLINE_THRESHOLD) {
        session.status = 'offline';
      } else if (elapsed > SessionService.IDLE_THRESHOLD) {
        session.status = 'idle';
      }
    }
  }
}

// Auto-initialize when module loads
SessionService.init();