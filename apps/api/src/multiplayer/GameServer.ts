// apps/api/src/multiplayer/GameServer.ts
// WebSocket game server: handles player connections, position sync, chat
// messages, and emotes. Uses the `ws` library attached to the HTTP server.
import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

// --- Message types -----------------------------------------------------------

export type WSMessageType =
  | 'player-join'
  | 'player-leave'
  | 'player-move'
  | 'chat'
  | 'emote'
  | 'player-list';

export interface WSMessage {
  type: WSMessageType;
  playerId: string;
  payload?: unknown;
}

export interface PlayerMovePayload {
  position: { x: number; y: number; z: number };
  rotation: number;
  zone: string;
}

export interface ChatPayload {
  text: string;
  timestamp: number;
}

export interface EmotePayload {
  emote: string;
  timestamp: number;
}

export interface PlayerInfo {
  playerId: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  zone: string;
}

// --- Server state ------------------------------------------------------------

interface ConnectedPlayer {
  ws: WebSocket;
  info: PlayerInfo;
}

const MAX_CHAT_LENGTH = 200;
const BROADCAST_INTERVAL_MS = 50; // throttle position broadcasts

export class GameServer {
  private wss: WebSocketServer;
  private players = new Map<string, ConnectedPlayer>();
  private broadcastTimer?: ReturnType<typeof setInterval>;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));
    console.log('🎮 WebSocket game server initialized on /ws');
  }

  private handleConnection(ws: WebSocket, req: import('http').IncomingMessage): void {
    // Extract player ID from query string: /ws?playerId=xxx&name=yyy
    const url = new URL(req.url ?? '', `http://${req.headers.host}`);
    const playerId = url.searchParams.get('playerId');
    const name = url.searchParams.get('name') ?? 'Student';

    if (!playerId) {
      ws.close(4001, 'Missing playerId');
      return;
    }

    // Disconnect existing connection for this player
    const existing = this.players.get(playerId);
    if (existing) {
      existing.ws.close(4002, 'Reconnected');
    }

    const info: PlayerInfo = {
      playerId,
      name,
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      zone: 'main_building_1f',
    };

    this.players.set(playerId, { ws, info });
    console.log(`[ws] Player connected: ${name} (${playerId}). Total: ${this.players.size}`);

    // Send current player list to the new player
    this.sendTo(ws, {
      type: 'player-list',
      playerId: 'server',
      payload: this.getPlayerList(),
    });

    // Broadcast join to others
    this.broadcastExcept(playerId, {
      type: 'player-join',
      playerId,
      payload: info,
    });

    // Handle messages
    ws.on('message', (data) => {
      try {
        const msg: WSMessage = JSON.parse(data.toString());
        this.handleMessage(playerId, msg);
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on('close', () => {
      this.players.delete(playerId);
      console.log(`[ws] Player disconnected: ${name} (${playerId}). Total: ${this.players.size}`);
      this.broadcastExcept(playerId, {
        type: 'player-leave',
        playerId,
      });
    });

    ws.on('error', (err) => {
      console.error(`[ws] Error for ${playerId}:`, err.message);
      this.players.delete(playerId);
    });
  }

  private handleMessage(playerId: string, msg: WSMessage): void {
    const player = this.players.get(playerId);
    if (!player) return;

    switch (msg.type) {
      case 'player-move': {
        const payload = msg.payload as PlayerMovePayload;
        player.info.position = payload.position;
        player.info.rotation = payload.rotation;
        player.info.zone = payload.zone;
        break;
      }
      case 'chat': {
        const payload = msg.payload as ChatPayload;
        const text = (payload.text ?? '').slice(0, MAX_CHAT_LENGTH);
        if (!text.trim()) return;
        this.broadcastAll({
          type: 'chat',
          playerId,
          payload: { text, timestamp: Date.now() },
        });
        break;
      }
      case 'emote': {
        const payload = msg.payload as EmotePayload;
        this.broadcastAll({
          type: 'emote',
          playerId,
          payload: { emote: payload.emote, timestamp: Date.now() },
        });
        break;
      }
    }
  }

  /** Start periodic position broadcast to all players. */
  startBroadcastLoop(): void {
    this.broadcastTimer = setInterval(() => {
      if (this.players.size < 2) return;
      const list = this.getPlayerList();
      for (const [, player] of this.players) {
        this.sendTo(player.ws, {
          type: 'player-list',
          playerId: 'server',
          payload: list,
        });
      }
    }, BROADCAST_INTERVAL_MS * 20); // ~1s full sync
  }

  stopBroadcastLoop(): void {
    if (this.broadcastTimer) {
      clearInterval(this.broadcastTimer);
      this.broadcastTimer = undefined;
    }
  }

  private getPlayerList(): PlayerInfo[] {
    return Array.from(this.players.values()).map((p) => p.info);
  }

  private sendTo(ws: WebSocket, msg: WSMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }

  private broadcastAll(msg: WSMessage): void {
    const data = JSON.stringify(msg);
    for (const [, player] of this.players) {
      if (player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(data);
      }
    }
  }

  private broadcastExcept(excludeId: string, msg: WSMessage): void {
    const data = JSON.stringify(msg);
    for (const [id, player] of this.players) {
      if (id !== excludeId && player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(data);
      }
    }
  }

  /** Get the number of connected players. */
  get playerCount(): number {
    return this.players.size;
  }

  /** Gracefully close all connections. */
  shutdown(): void {
    this.stopBroadcastLoop();
    for (const [, player] of this.players) {
      player.ws.close(1001, 'Server shutting down');
    }
    this.players.clear();
    this.wss.close();
  }
}
