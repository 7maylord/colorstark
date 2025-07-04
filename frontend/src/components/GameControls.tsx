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
    <div className="flex items-center justify-center space-x-6 p-6">
      {!gameState || !gameState.isActive ? (
        // Start Game Button
        <button
          className={`
            group relative px-10 py-4 text-xl font-bold rounded-2xl transition-all duration-300 transform
            ${isStarting 
              ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed scale-95' 
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-500 hover:via-pink-500 hover:to-red-500 hover:scale-105 active:scale-95'
            }
            text-white shadow-2xl border-2 border-white/20 hover:border-white/40
            hover:shadow-purple-500/50 overflow-hidden
          `}
          onClick={handleStartGame}
          disabled={isStarting || !account || !contract}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/20 to-purple-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          {/* Button Content */}
          <div className="relative z-10 flex items-center space-x-3">
            {isStarting ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>🚀 Starting Game...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">🎮</span>
                <span>Start New Game</span>
                <span className="text-2xl">⚡</span>
              </>
            )}
          </div>
          
          {/* Glow Effect */}
          {!isStarting && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
          )}
        </button>
      ) : (
        // Game Active State
        <div className="flex items-center space-x-6">
          {/* Game Status Indicator */}
          <div className="flex items-center space-x-4 px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl border border-green-500/30">
            <div className="relative">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-green-400 font-bold text-lg">🎯 Game Active!</span>
            <div className="text-sm text-gray-300">
              {gameState.moves} moves • {Math.round((5 - (5 - 0)) / 5 * 100)}% complete
            </div>
          </div>

          {/* End Game Button - Gamy Style */}
          <button
            className={`
              group relative px-8 py-3 text-lg font-bold rounded-xl transition-all duration-300 transform
              ${isEnding 
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed scale-95' 
                : 'bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-500 hover:via-orange-500 hover:to-yellow-500 hover:scale-105 active:scale-95'
              }
              text-white shadow-xl border-2 border-red-400/40 hover:border-red-300/60
              hover:shadow-red-500/50 overflow-hidden
            `}
            onClick={handleEndGame}
            disabled={isEnding}
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-white/20 to-red-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
            
            {/* Warning Stripes */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent transform -skew-x-12 w-8 animate-pulse"></div>
            </div>
            
            {/* Button Content */}
            <div className="relative z-10 flex items-center space-x-2">
              {isEnding ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>⏳ Ending...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">⛔</span>
                  <span>End Game</span>
                  <span className="text-lg">🏁</span>
                </>
              )}
            </div>
            
            {/* Danger Glow */}
            {!isEnding && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-300"></div>
            )}
          </button>
        </div>
      )}
    </div>
  );
}