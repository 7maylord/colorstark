'use client';

import { useAccount } from '@starknet-react/core';
import { useState, useEffect } from 'react';
import { useStarknet } from '@/hooks/useStarknet';
import GameControls from '@/components/GameControls';
import GameBoard from '@/components/GameBoard';
import PlayerInfo from '@/components/PlayerInfo';
import SetNameModal from '../components/SetNameModal';
import GameIntro from '@/components/GameIntro';

export default function Home() {
  const { address } = useAccount();
  const { 
    account, 
    contract, 
    gameId, 
    setGameId, 
    gameState, 
    setGameState, 
    correctBottles, 
    playerPoints, 
    playerName, 
    updatePlayerData, 
    updateLeaderboard, 
    updateGameState 
  } = useStarknet();
  const [showSetNameModal, setShowSetNameModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);

  const handleStartGame = async () => {
    if (!address) {
      // Wallet not connected - this will be handled by the GameIntro component
      return;
    }

    setIsLoadingPlayer(true);
    
    // Check if player has a name set in the contract
    try {
      if (contract && address) {
        // Small delay to check player data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!playerName || playerName === 'Unnamed') {
          setShowSetNameModal(true);
        } else {
          setGameStarted(true);
        }
      }
    } catch (error) {
      console.error('Error checking player data:', error);
      setShowSetNameModal(true);
    } finally {
      setIsLoadingPlayer(false);
    }
  };

  const handleNameSet = () => {
    setShowSetNameModal(false);
    setGameStarted(true);
  };

  // If game is started and wallet is connected, show the game interface
  if (gameStarted && address && account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Game Area */}
            <div className="lg:col-span-3 space-y-6">
              <PlayerInfo 
                account={account}
                contract={contract}
                playerName={playerName}
                playerPoints={playerPoints}
                updatePlayerData={updatePlayerData}
                updateLeaderboard={updateLeaderboard}
              />
              {gameState && (
                <GameBoard
                  account={account}
                  contract={contract}
                  gameId={gameId}
                  gameState={gameState}
                  correctBottles={correctBottles}
                  updateGameState={updateGameState}
                  updatePlayerData={updatePlayerData}
                />
              )}
              <GameControls
                account={account}
                contract={contract}
                gameState={gameState}
                gameId={gameId}
                setGameId={setGameId}
                updateGameState={updateGameState}
              />
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Game stats could go here in the future */}
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Game Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Your Score</span>
                    <span className="text-white font-bold">{playerPoints}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Games Played</span>
                    <span className="text-white font-bold">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-white font-bold">-</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-gray-400 text-sm text-center">
                    Check the full leaderboard in the navbar!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing page with gaming UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Bottles Animation */}
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-8 h-12 bg-red-500 rounded-full opacity-20 blur-sm"></div>
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <div className="w-6 h-10 bg-blue-500 rounded-full opacity-20 blur-sm"></div>
        </div>
        <div className="absolute bottom-40 left-20 animate-float-slow">
          <div className="w-7 h-11 bg-green-500 rounded-full opacity-20 blur-sm"></div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float">
          <div className="w-5 h-9 bg-yellow-500 rounded-full opacity-20 blur-sm"></div>
        </div>
        <div className="absolute top-60 left-1/3 animate-float-delayed">
          <div className="w-6 h-10 bg-purple-500 rounded-full opacity-20 blur-sm"></div>
        </div>
        
        {/* Particle Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full opacity-30 animate-twinkle"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full opacity-30 animate-twinkle-delayed"></div>
          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white rounded-full opacity-30 animate-twinkle"></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-white rounded-full opacity-30 animate-twinkle-delayed"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 max-w-6xl mx-auto">
          <GameIntro 
            onStartGame={handleStartGame}
            isLoadingPlayer={isLoadingPlayer}
            walletConnected={!!address}
          />
        </div>
      </div>

      {/* Set Name Modal */}
      {showSetNameModal && (
        <SetNameModal 
          onClose={() => setShowSetNameModal(false)}
          onNameSet={handleNameSet}
        />
      )}
    </div>
  );
}