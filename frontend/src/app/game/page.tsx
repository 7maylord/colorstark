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
    updateGameState,
    findActiveGame,
    getNextGameId
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

        {/* Player Info Header */}
        <div className="mb-8">
          <PlayerInfo 
            account={account || null}
            contract={contract}
            playerName={playerName}
            playerPoints={playerPoints}
            updatePlayerData={updatePlayerData}
            updateLeaderboard={updateLeaderboard}
          />
        </div>

        {/* Main Game Area */}
        {gameState ? (
          <div className="space-y-8">
            <GameBoard
              account={account || null}
              contract={contract}
              gameId={gameId}
              gameState={gameState}
              correctBottles={correctBottles}
              updateGameState={updateGameState}
              updatePlayerData={updatePlayerData}
            />
            
            {/* Game Controls */}
            <div className="flex justify-center">
              <GameControls
                account={account || null}
                contract={contract}
                gameState={gameState}
                gameId={gameId}
                setGameId={setGameId}
                updateGameState={updateGameState}
                findActiveGame={findActiveGame}
                getNextGameId={getNextGameId}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-12">
              <div className="text-6xl mb-6">🧪</div>
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Start?</h3>
              <p className="text-gray-300 mb-8">Click "Start Game" below to begin your bottle-switching adventure!</p>
              <GameControls
                account={account || null}
                contract={contract}
                gameState={gameState}
                gameId={gameId}
                setGameId={setGameId}
                updateGameState={updateGameState}
                findActiveGame={findActiveGame}
                getNextGameId={getNextGameId}
              />
            </div>
          </div>
        )}
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