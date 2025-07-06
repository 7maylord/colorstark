"use client";

import { useAccount } from "@starknet-react/core";
import WalletConnectButton from "./WalletConnectButton";
import Link from "next/link";

export default function GameIntro() {
  const { address } = useAccount();
  const walletConnected = !!address;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
      {/* Game Logo/Title */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-6 mb-6">
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent tracking-tight">
            COLOR
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse transform rotate-52 mx-2"></div>
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-blue-400 via-teal-500 to-green-500 bg-clip-text text-transparent tracking-tight">
            STARK
          </h1>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-6 animate-slide-up-delayed">
        {!walletConnected ? (
          <div className="space-y-4 flex flex-col items-center">
            <p className="flex justify-center text-gray-400 text-lg">Connect your Starknet wallet to begin</p>
            <WalletConnectButton />
          </div>
        ) : (
          <div className="space-y-4 flex flex-col items-center">
            <Link href="/game">
              <button
                className="
                  relative px-12 py-4 text-2xl font-bold rounded-xl 
                  bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 
                  hover:from-purple-500 hover:via-pink-500 hover:to-red-500
                  text-white shadow-2xl border-2 border-white/20
                  transform transition-all duration-300 
                  scale-100 hover:scale-105 hover:shadow-purple-500/50
                "
              >
                <span className="relative z-10">GO TO GAME</span>
              </button>
            </Link>
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