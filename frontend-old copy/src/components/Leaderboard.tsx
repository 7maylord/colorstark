'use client';

import { useStarknet } from '../hooks/useStarknet';

export default function Leaderboard() {
  const { leaderboard } = useStarknet();

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '👑';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getRankColors = (index: number) => {
    switch (index) {
      case 0: return 'border-l-yellow-500 bg-yellow-500/10';
      case 1: return 'border-l-gray-400 bg-gray-400/10';
      case 2: return 'border-l-orange-500 bg-orange-500/10';
      default: return 'border-l-purple-500 bg-purple-500/5';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
      <h2 className="text-2xl font-bold text-white mb-6 text-center bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent">
        🏆 Leaderboard
      </h2>
      
      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎮</div>
          <p className="text-gray-400">No players yet!</p>
          <p className="text-gray-500 text-sm mt-2">Be the first to join</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {leaderboard.slice(0, 10).map((player, index) => (
            <div
              key={player.address}
              className={`
                leaderboard-entry p-4 rounded-xl border-l-4 
                transition-all duration-300 hover:bg-white/10
                ${getRankColors(index)}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {getRankIcon(index)}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">
                      {player.name || 'Unnamed'}
                    </div>
                    <div className="text-gray-400 text-xs font-mono">
                      {player.address.slice(0, 6)}...{player.address.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">
                    {player.points}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {player.points === '1' ? 'pt' : 'pts'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {leaderboard.length > 10 && (
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            Showing top 10 players
          </p>
        </div>
      )}
    </div>
  );
}