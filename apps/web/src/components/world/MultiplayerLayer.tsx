// MultiplayerLayer: renders all remote players and sends local position updates
// to the server. Placed inside the Scene3D Canvas.
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useGameStore } from '../../store/gameStore';
import { useClockStore } from '../../store/clockStore';
import RemotePlayerCharacter from './RemotePlayerCharacter';

const POSITION_SEND_INTERVAL_MS = 100;

export default function MultiplayerLayer() {
  const remotePlayers = useMultiplayerStore((s) => s.remotePlayers);
  const sendPosition = useMultiplayerStore((s) => s.sendPosition);
  const status = useMultiplayerStore((s) => s.status);
  const lastSendRef = useRef(0);

  useFrame(() => {
    if (status !== 'connected') return;

    const now = Date.now();
    if (now - lastSendRef.current < POSITION_SEND_INTERVAL_MS) return;
    lastSendRef.current = now;

    const { playerPosition } = useGameStore.getState();
    const zone = useClockStore.getState().phase; // use current zone from game state
    sendPosition(
      { x: playerPosition.x, y: playerPosition.y, z: playerPosition.z },
      0, // rotation — can be extended later
      'main_building_1f', // zone — simplified for now
    );
  });

  if (status !== 'connected') return null;

  return (
    <>
      {Object.values(remotePlayers).map((player) => (
        <RemotePlayerCharacter key={player.playerId} player={player} />
      ))}
    </>
  );
}
