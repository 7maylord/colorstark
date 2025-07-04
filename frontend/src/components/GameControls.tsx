'use client';

import { Contract, uint256 } from 'starknet';
import { AccountInterface } from 'starknet';
import { GameState } from '../hooks/useStarknet';
import { useState } from 'react';

interface GameControlsProps {
  account: AccountInterface | null;
  contract: Contract | null;
  gameState: GameState | null;
  gameId: string | null;
  setGameId: (gameId: string | null) => void;
  updateGameState: (gameId: string | null) => Promise<void>;
  findActiveGame: () => Promise<string | null>;
  getNextGameId: () => Promise<string>;
}

export default function GameControls({ 
  account, 
  contract, 
  gameState, 
  gameId, 
  setGameId, 
  updateGameState, 
  findActiveGame,
  getNextGameId 
}: GameControlsProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  async function handleStartGame() {
    if (!account || !contract) return;
    setIsStarting(true);
    
    try {
      // Get the game ID that will be created
      const nextGameId = await getNextGameId();
      
      // Start the game
      await contract.invoke('start_game', []);
      
      // Set the game ID and update state
      setGameId(nextGameId);
      await updateGameState(nextGameId);
    } catch (error) {
      console.error('Error starting game:', error);
      // Try to find active game as fallback
      const activeGameId = await findActiveGame();
      if (activeGameId) {
        setGameId(activeGameId);
        await updateGameState(activeGameId);
      } else {
        setGameId(null);
      }
    } finally {
      setIsStarting(false);
    }
  }

  async function handleEndGame() {
    if (!account || !contract || !gameId) return;
    setIsEnding(true);
    
    try {
      const gameIdUint256 = uint256.bnToUint256(BigInt(gameId));
      await contract.invoke('end_game', [gameIdUint256]);
      setGameId(null);
      await updateGameState(null);
    } catch (error) {
      console.error('Error ending game:', error);
    } finally {
      setIsEnding(false);
    }
  }

  return (
    <div className="flex items-center justify-center space-x-4">
      {!gameState || !gameState.isActive ? (
        <button
          className={`
            px-8 py-3 text-lg font-bold rounded-xl transition-all duration-300
            ${isStarting 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:via-pink-500 hover:to-red-500 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105'
            }
            text-white border-2 border-white/20
          `}
          onClick={handleStartGame}
          disabled={isStarting || !account || !contract}
        >
          {isStarting ? (
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Starting Game...</span>
            </div>
          ) : (
            'Start New Game'
          )}
        </button>
      ) : (
        <div className="flex items-center space-x-4">
          <div className="text-green-400 font-medium flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span>Game Active</span>
          </div>
          <button
            className={`
              px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300
              ${isEnding 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-500 shadow-lg hover:shadow-red-500/25'
              }
              text-white border border-red-400/20
            `}
            onClick={handleEndGame}
            disabled={isEnding}
          >
            {isEnding ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Ending...</span>
              </div>
            ) : (
              'End Game'
            )}
          </button>
        </div>
      )}
    </div>
  );
}