'use client';

import { useState } from 'react';
import WalletConnector from './WalletConnector';

interface GameIntroProps {
  onStartGame: () => void;
  isLoadingPlayer: boolean;
  walletConnected: boolean;
}

export default function GameIntro({ onStartGame, isLoadingPlayer, walletConnected }: GameIntroProps) {
  const [hoveredButton, setHoveredButton] = useState(false);

  return (
    <div className="text-center max-w-4xl mx-auto">
      {/* Game Logo/Title */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-6 mb-6">
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent tracking-tight">
            COLOR
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse transform rotate-55 mx-4"></div>
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-blue-400 via-teal-500 to-green-500 bg-clip-text text-transparent tracking-tight">
            STARK
          </h1>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-6 animate-slide-up-delayed">
        {!walletConnected ? (
          <div className="space-y-4">
            <p className="text-gray-400 text-lg">Connect your Starknet wallet to begin</p>
            <div className="flex justify-center">
              <WalletConnector />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={onStartGame}
              disabled={isLoadingPlayer}
              onMouseEnter={() => setHoveredButton(true)}
              onMouseLeave={() => setHoveredButton(false)}
              className={`
                relative px-12 py-4 text-2xl font-bold rounded-xl 
                bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 
                hover:from-purple-500 hover:via-pink-500 hover:to-red-500
                text-white shadow-2xl border-2 border-white/20
                transform transition-all duration-300 
                ${hoveredButton ? 'scale-105 shadow-purple-500/25' : 'scale-100'}
                ${isLoadingPlayer ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-purple-500/50'}
                disabled:transform-none disabled:hover:from-purple-600 disabled:hover:via-pink-600 disabled:hover:to-red-600
              `}
            >
              {isLoadingPlayer ? (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading Player...</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">START GAME</span>
                  {hoveredButton && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-xl blur-xl opacity-75 animate-pulse"></div>
                  )}
                </>
              )}
            </button>
            
            <p className="text-gray-400 text-sm">
              Ready to test your color matching skills?
            </p>
          </div>
        )}
      </div>

      {/* Game Description */}
      <div className="mb-12 animate-slide-up">
        <p className="text-xl md:text-2xl text-gray-300 mb-6 leading-relaxed">
          Master the art of <span className="text-purple-400 font-bold">color matching</span> in this mind-bending puzzle game
        </p>
        <p className="text-lg text-gray-400 mb-8">
          Built on Starknet • Play to Earn • Compete Globally
        </p>
        
        {/* Game Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              🎯
            </div>
            <h3 className="text-white font-semibold mb-2">Pattern Matching</h3>
            <p className="text-gray-400 text-sm">Match bottle sequences to advance through challenging levels</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              🏆
            </div>
            <h3 className="text-white font-semibold mb-2">Global Rankings</h3>
            <p className="text-gray-400 text-sm">Compete with players worldwide on the leaderboard</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-green-500/50 transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              💎
            </div>
            <h3 className="text-white font-semibold mb-2">Blockchain Rewards</h3>
            <p className="text-gray-400 text-sm">Earn points and achievements stored on Starknet</p>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="mt-16 pt-8 border-t border-white/10">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-400">1,337+</div>
            <div className="text-gray-400 text-sm">Games Played</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">42</div>
            <div className="text-gray-400 text-sm">Active Players</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">256</div>
            <div className="text-gray-400 text-sm">High Score</div>
          </div>
        </div>
      </div>
    </div>
  );
} 