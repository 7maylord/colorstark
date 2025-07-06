"use client";

import { useAccount } from "@starknet-react/core";
import WalletConnectButton from "./WalletConnectButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Contract, shortString } from "starknet";
import colorStarkAbi from "../abi/color_stark.json";

export default function GameIntro() {
  const { address, account } = useAccount();
  const walletConnected = !!address;
  const [playerName, setPlayerName] = useState<string>("");
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

  useEffect(() => {
    const fetchName = async () => {
      if (account && address && contractAddress) {
        try {
          const contract = new Contract(colorStarkAbi as any, contractAddress, account);
          const nameFelt = await contract.call("get_player_name", [address]);
          let name = "";
          if (nameFelt && typeof nameFelt === "object" && "toString" in nameFelt) {
            name = shortString.decodeShortString(nameFelt.toString());
          } else if (typeof nameFelt === "string") {
            name = shortString.decodeShortString(nameFelt);
          }
          setPlayerName(name);
          if (name) localStorage.setItem("colorstark_player_name", name);
        } catch (err) {
          setPlayerName("");
        }
      }
    };
    fetchName();
  }, [account, address, contractAddress]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
      {/* Game Logo/Title */}
      <div className="mb-4 animate-fade-in">
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
          <div className="space-y-4 mb-4 mt-4flex flex-col items-center">
            {playerName && (
              <div className="text-lg text-white font-semibold">Welcome, {playerName}!</div>
            )}
            <Link href="/game">
              <button
                className="
                  relative px-12 mb-4 py-4 text-2xl font-bold rounded-xl 
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
      <div className="mb-12 animate-slide-up text-center flex flex-col items-center">
        <p className="text-xl md:text-2xl text-gray-300 mb-6 leading-relaxed text-center">
          Master the art of <span className="text-purple-400 font-bold">color matching</span> in this mind-bending puzzle game
        </p>
        <p className="text-lg text-gray-400 mb-8 text-center">
          Built on Starknet • Play to Earn • Compete Globally
        </p>
        {/* Game Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-3xl mx-auto justify-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              🎯
            </div>
            <h3 className="text-white font-semibold mb-2">Pattern Matching</h3>
            <p className="text-gray-400 text-sm">Match bottle sequences to advance through challenging levels</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              🏆
            </div>
            <h3 className="text-white font-semibold mb-2">Global Rankings</h3>
            <p className="text-gray-400 text-sm">Compete with players worldwide on the leaderboard</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-green-500/50 transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              💎
            </div>
            <h3 className="text-white font-semibold mb-2">Blockchain Rewards</h3>
            <p className="text-gray-400 text-sm">Earn points and achievements stored on Starknet</p>
          </div>
        </div>
        {/* Bottom Stats */}
        <div className="pt-4 border-t border-white/10 w-full max-w-3xl mx-auto">
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
    </div>
  );
} 