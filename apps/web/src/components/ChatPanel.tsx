// ChatPanel: shows chat messages and allows sending messages to other players.
// Toggled with the T key. Also shows emote buttons.
import { useEffect, useRef, useState } from 'react';
import { useMultiplayerStore } from '../store/multiplayerStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EMOTES = ['👋', '👍', '❤️', '😂', '🎉', '💪', '🤔', '😎'];

export default function ChatPanel({ isOpen, onClose }: Props) {
  const { chatMessages, sendChat, sendEmote, remotePlayers, playerCount, status } = useMultiplayerStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!isOpen) return null;

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendChat(text);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlayerName = (playerId: string): string => {
    return remotePlayers[playerId]?.name ?? playerId;
  };

  return (
    <div className="absolute bottom-4 right-4 z-50 w-[360px] max-w-[90vw]">
      <div className="bg-gray-900/95 border-2 border-cyan-500 rounded-xl shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-cyan-600/30">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">💬 Chat</h3>
            <span className={`text-xs px-1.5 py-0.5 rounded ${status === 'connected' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'}`}>
              {status === 'connected' ? `${playerCount} online` : 'offline'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="h-[200px] overflow-y-auto px-3 py-2 space-y-1">
          {chatMessages.length === 0 ? (
            <div className="text-gray-500 text-xs text-center py-4">
              {status === 'connected' ? 'No messages yet. Say hi!' : 'Connect to chat with other players.'}
            </div>
          ) : (
            chatMessages.map((msg, i) => (
              <div key={i} className="text-xs">
                <span className="text-cyan-300 font-bold">{getPlayerName(msg.playerId)}: </span>
                <span className="text-gray-200">{msg.text}</span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Emote buttons */}
        <div className="px-3 py-1 flex gap-1 flex-wrap border-t border-gray-700/50">
          {EMOTES.map((emote) => (
            <button
              key={emote}
              onClick={() => sendEmote(emote)}
              className="text-lg hover:scale-125 transition-transform"
              title={emote}
            >
              {emote}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 px-3 py-2 border-t border-gray-700/50">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={status === 'connected' ? 'Type a message...' : 'Offline'}
            disabled={status !== 'connected'}
            maxLength={200}
            className="flex-1 bg-gray-800 text-white text-sm px-3 py-1.5 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={status !== 'connected' || !input.trim()}
            className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
