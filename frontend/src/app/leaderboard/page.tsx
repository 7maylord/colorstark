"use client";

import { useEffect, useState } from "react";
import { Contract, Provider, shortString } from "starknet";
import BottlesBackground from "../../components/BottlesBackground";
import { Trophy, Sparkles } from "lucide-react";
import colorStarkAbi from "../../abi/color_stark.json";

// Helper to format contract address as 0x-prefixed hex string
function formatAddress(addr: any) {
  let hex = typeof addr === 'bigint'
    ? '0x' + addr.toString(16)
    : typeof addr === 'string' && !addr.startsWith('0x')
      ? '0x' + BigInt(addr).toString(16)
      : String(addr);
  return `${hex.slice(0, 8)}...${hex.slice(-6)}`;
}

// Helper to get medal emoji
function getMedal(index: number) {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return null;
}

// Helper to get avatar color
function getAvatarColor(name: string) {
  const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-400", "bg-purple-500"];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return colors[sum % colors.length];
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "";
  const provider = new Provider({ nodeUrl: rpcUrl });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const contract = new Contract(colorStarkAbi as any, contractAddress, provider);
        const playersRaw = await contract.call("get_all_player_points", []);
        const playersArr = Array.isArray(playersRaw)
          ? playersRaw
          : typeof playersRaw === "object" && playersRaw !== null
            ? Object.values(playersRaw)
            : [];
        const leaderboardData = playersArr.map((player: any) => {
          const p = Array.isArray(player) ? player : Object.values(player);
          // p: [address, name, points, moves]
          let name = "";
          try {
            if (typeof p[1] === "bigint") {
              name = shortString.decodeShortString(p[1].toString());
            } else if (typeof p[1] === "string") {
              name = shortString.decodeShortString(p[1]);
            } else if (p[1] && typeof p[1] === "object" && "toString" in p[1]) {
              name = shortString.decodeShortString(p[1].toString());
            }
          } catch {
            name = "";
          }
          return {
            address: p[0],
            name,
            points: Number(typeof p[2] === 'bigint' ? p[2].toString() : p[2]),
            moves: Number(typeof p[3] === 'bigint' ? p[3].toString() : p[3]),
          };
        });
        leaderboardData.sort((a, b) => b.points - a.points || a.moves - b.moves);
        setLeaderboard(leaderboardData);
      } catch (err) {
        setLeaderboard([]);
      }
    };
    fetchLeaderboard();
  }, []);

  // Find the top score for progress bars
  const topScore = leaderboard.length > 0 ? leaderboard[0].points : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      <BottlesBackground />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-10">
        <div className="max-w-full sm:max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            {/* Row of tiny bottles */}
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <span key={i} className={
                  ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-400", "bg-purple-500", "bg-pink-500", "bg-teal-400"][i % 7] +
                  " w-4 h-6 rounded-b-full border-2 border-white/30 shadow"
                } />
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-white/20 via-purple-200/20 to-blue-200/20 backdrop-blur-xl rounded-2xl p-2 sm:p-6 border border-white/30 shadow-xl ring-1 ring-purple-200/30">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2 animate-pulse bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 animate-bounce" />
              Leaderboard
              <Sparkles className="w-5 h-5 text-pink-300 animate-spin-slow" />
            </h2>
            <div className="space-y-2 sm:space-y-3 overflow-x-auto">
              <div className="flex min-w-[340px] sm:min-w-0 items-center justify-between px-2 sm:px-3 pb-2 border-b border-white/20 text-xs sm:text-sm font-semibold">
                <span className="w-6 sm:w-8 text-center">#</span>
                <span className="w-10 sm:w-12 text-center mr-3 sm:mr-5">Avatar</span>
                <span className="flex-1">Name</span>
                <span className="w-20 sm:w-32 text-right">Points</span>
                <span className="w-16 sm:w-24 text-right">Moves</span>
              </div>
              {leaderboard.map((player, index) => (
                <div
                  key={String(player.address) + index}
                  className={
                    `flex min-w-[340px] sm:min-w-0 items-center justify-between p-2 sm:p-3 rounded-lg transition-all duration-200 group ` +
                    (index === 0 ? 'bg-gradient-to-r from-yellow-600 to-orange-600 shadow-lg' : 
                      index === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-600 shadow' :
                      index === 2 ? 'bg-gradient-to-r from-amber-700 to-orange-700 shadow' :
                      'bg-white bg-opacity-10 hover:bg-gradient-to-r hover:from-purple-700/40 hover:to-blue-700/40') +
                    ' hover:scale-[1.025] hover:shadow-xl'
                  }
                >
                  <span className="text-base sm:text-lg font-bold w-6 sm:w-8 text-center">
                    {getMedal(index) || index + 1}
                  </span>
                  {/* Avatar */}
                  <span className={`w-10 sm:w-12 h-10 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white/30 shadow ${getAvatarColor(player.name || player.address)} mr-3 sm:mr-5`}>
                    {player.name ? player.name[0].toUpperCase() : "?"}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold truncate max-w-[100px] sm:max-w-none">{player.name || 'Unnamed'}</p>
                    <p className="text-xs text-gray-300 truncate max-w-[100px] sm:max-w-none">{formatAddress(player.address)}</p>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full mt-1">
                      <div
                        className={
                          `h-2 rounded-full transition-all duration-500 ` +
                          (index === 0 ? 'bg-yellow-400' :
                            index === 1 ? 'bg-gray-300' :
                            index === 2 ? 'bg-amber-700' :
                            'bg-gradient-to-r from-purple-400 via-blue-400 to-green-400')
                        }
                        style={{ width: `${Math.max(10, (player.points / topScore) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-20 sm:w-32 text-right font-bold">{player.points}</span>
                  <span className="w-16 sm:w-24 text-right font-mono">{player.moves}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 