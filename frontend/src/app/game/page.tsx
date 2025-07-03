'use client';

import { useAccount } from '@starknet-react/core';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStarknet } from '@/hooks/useStarknet';
import GameControls from '@/components/GameControls';
import GameBoard from '@/components/GameBoard';
import PlayerInfo from '@/components/PlayerInfo';
import SetNameModal from '@/components/SetNameModal';

export default function GamePage() {
  const { address } = useAccount();
  const router = useRouter();
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if wallet is connected, if not redirect to home
    if (!address) {
      router.push('/');
      return;
    }

    // Check if player has a name set
    const checkPlayerData = async () => {
      try {
        if (contract && address) {
          // Small delay to load player data
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (!playerName || playerName === 'Unnamed') {
            setShowSetNameModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking player data:', error);
        setShowSetNameModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkPlayerData();
  }, [address, contract, playerName, router]);

  const handleNameSet = () => {
    setShowSetNameModal(false);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackToHome}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              ColorStark Game
            </h1>
            <p className="text-gray-300 mt-2">Switch bottles to match the target arrangement</p>
          </div>
          
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3 space-y-6">
            <PlayerInfo 
              account={account || null}
              contract={contract}
              playerName={playerName}
              playerPoints={playerPoints}
              updatePlayerData={updatePlayerData}
              updateLeaderboard={updateLeaderboard}
            />
            
            {gameState && (
              <GameBoard
                account={account || null}
                contract={contract}
                gameId={gameId}
                gameState={gameState}
                correctBottles={correctBottles}
                updateGameState={updateGameState}
                updatePlayerData={updatePlayerData}
              />
            )}
            
            <GameControls
              account={account || null}
              contract={contract}
              gameState={gameState}
              gameId={gameId}
              setGameId={setGameId}
              updateGameState={updateGameState}
            />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
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
                  Match the bottle colors to advance!
                </p>
              </div>
            </div>

            {/* Game Instructions */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mt-6">
              <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Click on bottles to switch their positions</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Match the target arrangement shown above</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Complete levels to earn points and climb the leaderboard</p>
                </div>
              </div>
            </div>
          </div>
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