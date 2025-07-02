'use client';

import { Contract } from 'starknet';
import { AccountInterface } from 'starknet';
import { GameState } from '../hooks/useStarknet';

interface GameControlsProps {
  account: AccountInterface | null;
  contract: Contract | null;
  gameState: GameState | null;
  gameId: string | null;
  setGameId: (gameId: string | null) => void;
  updateGameState: (gameId: string | null) => Promise<void>;
}

export default function GameControls({ account, contract, gameState, gameId, setGameId, updateGameState }: GameControlsProps) {
  async function handleStartGame() {
    if (!account || !contract) return;
    try {
      await contract.invoke('start_game', []);
      const gameIdRes = await contract.call('get_player_games', [account.address]);
      const newGameId = gameIdRes.toString();
      setGameId(newGameId);
      await updateGameState(newGameId);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }

  async function handleEndGame() {
    if (!account || !contract || !gameId) return;
    try {
      await contract.invoke('end_game', [gameId]);
      setGameId(null);
      await updateGameState(null);
    } catch (error) {
      console.error('Error ending game:', error);
    }
  }

  return (
    <div className="mb-4">
      <button
        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 mr-2"
        onClick={handleStartGame}
        disabled={!!(gameState && gameState.isActive)}
      >
        Start Game
      </button>
      {gameState && gameState.isActive && (
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          onClick={handleEndGame}
        >
          End Game
        </button>
      )}
    </div>
  );
}