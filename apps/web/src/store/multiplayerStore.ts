// apps/web/src/store/multiplayerStore.ts
// MultiplayerStore: manages WebSocket connection, other players' positions,
// chat messages, and emotes. Connects to the game server's /ws endpoint.
import { create } from 'zustand';

export interface RemotePlayer {
  playerId: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  zone: string;
}

export interface ChatMessage {
  playerId: string;
  text: string;
  timestamp: number;
}

export interface EmoteEvent {
  playerId: string;
  emote: string;
  timestamp: number;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface MultiplayerState {
  status: ConnectionStatus;
  remotePlayers: Record<string, RemotePlayer>;
  chatMessages: ChatMessage[];
  emoteEvents: EmoteEvent[];
  playerCount: number;

  connect: (playerId: string, name: string) => void;
  disconnect: () => void;
  sendPosition: (position: { x: number; y: number; z: number }, rotation: number, zone: string) => void;
  sendChat: (text: string) => void;
  sendEmote: (emote: string) => void;
  clearEmoteEvent: (timestamp: number) => void;
}

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const RECONNECT_DELAY_MS = 3000;
const MAX_CHAT_MESSAGES = 50;

function getWsUrl(playerId: string, name: string): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = window.location.port || '4000';
  const params = new URLSearchParams({ playerId, name });
  return `${protocol}//${host}:${port}/ws?${params}`;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  status: 'disconnected',
  remotePlayers: {},
  chatMessages: [],
  emoteEvents: [],
  playerCount: 1,

  connect: (playerId, name) => {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    set({ status: 'connecting' });

    try {
      ws = new WebSocket(getWsUrl(playerId, name));
    } catch {
      set({ status: 'disconnected' });
      return;
    }

    ws.onopen = () => {
      set({ status: 'connected' });
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleMessage(msg);
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      set({ status: 'disconnected', remotePlayers: {}, playerCount: 1 });
      ws = null;
      // Auto-reconnect
      reconnectTimer = setTimeout(() => {
        get().connect(playerId, name);
      }, RECONNECT_DELAY_MS);
    };

    ws.onerror = () => {
      ws?.close();
    };
  },

  disconnect: () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    ws?.close(1000, 'User disconnected');
    ws = null;
    set({ status: 'disconnected', remotePlayers: {}, playerCount: 1 });
  },

  sendPosition: (position, rotation, zone) => {
    if (ws?.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      type: 'player-move',
      playerId: 'self',
      payload: { position, rotation, zone },
    }));
  },

  sendChat: (text) => {
    if (ws?.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      type: 'chat',
      playerId: 'self',
      payload: { text, timestamp: Date.now() },
    }));
  },

  sendEmote: (emote) => {
    if (ws?.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({
      type: 'emote',
      playerId: 'self',
      payload: { emote, timestamp: Date.now() },
    }));
  },

  clearEmoteEvent: (timestamp) => {
    set((s) => ({
      emoteEvents: s.emoteEvents.filter((e) => e.timestamp !== timestamp),
    }));
  },
}));

// --- Message handler ---------------------------------------------------------

interface WSMessage {
  type: string;
  playerId: string;
  payload?: unknown;
}

function handleMessage(msg: WSMessage): void {
  switch (msg.type) {
    case 'player-list': {
      const players = msg.payload as RemotePlayer[];
      const remotePlayers: Record<string, RemotePlayer> = {};
      for (const p of players) {
        remotePlayers[p.playerId] = p;
      }
      set({ remotePlayers, playerCount: players.length });
      break;
    }
    case 'player-join': {
      const player = msg.payload as RemotePlayer;
      set((s) => ({
        remotePlayers: { ...s.remotePlayers, [msg.playerId]: player },
        playerCount: Object.keys(s.remotePlayers).length + 1,
      }));
      break;
    }
    case 'player-leave': {
      set((s) => {
        const { [msg.playerId]: _, ...rest } = s.remotePlayers;
        return { remotePlayers: rest, playerCount: Object.keys(rest).length + 1 };
      });
      break;
    }
    case 'chat': {
      const payload = msg.payload as { text: string; timestamp: number };
      set((s) => ({
        chatMessages: [
          ...s.chatMessages,
          { playerId: msg.playerId, text: payload.text, timestamp: payload.timestamp },
        ].slice(-MAX_CHAT_MESSAGES),
      }));
      break;
    }
    case 'emote': {
      const payload = msg.payload as { emote: string; timestamp: number };
      set((s) => ({
        emoteEvents: [
          ...s.emoteEvents,
          { playerId: msg.playerId, emote: payload.emote, timestamp: payload.timestamp },
        ],
      }));
      // Auto-clear after 3 seconds
      setTimeout(() => {
        get().clearEmoteEvent(payload.timestamp);
      }, 3000);
      break;
    }
  }
}
