"use client";

import { Trophy } from "lucide-react";
import BottlesBackground from "../../components/BottlesBackground";

const mockLeaderboard = [
  { name: 'Alice', points: 150, address: '0x1234...5678' },
  { name: 'Bob', points: 120, address: '0x2345...6789' },
  { name: 'Charlie', points: 95, address: '0x3456...7890' },
  { name: 'Diana', points: 80, address: '0x4567...8901' },
  { name: 'Eve', points: 65, address: '0x5678...9012' }
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      <BottlesBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Leaderboard
            </h2>
            <div className="space-y-3">
              {mockLeaderboard.map((player, index) => (
                <div
                  key={index}
                  className={
                    `flex items-center justify-between p-3 rounded-lg transition-all duration-200 ` +
                    (index === 0 ? 'bg-gradient-to-r from-yellow-600 to-orange-600' : 
                      index === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-r from-amber-700 to-orange-700' :
                      'bg-white bg-opacity-10')
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold w-8 text-center">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{player.name}</p>
                      <p className="text-xs text-gray-300">{player.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{player.points}</p>
                    <p className="text-xs text-gray-300">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 