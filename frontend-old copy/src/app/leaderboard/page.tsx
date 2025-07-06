'use client';


import { useEffect } from 'react';

export default function LeaderboardPage() {
  const { leaderboard, updateLeaderboard } = useStarknet();

  useEffect(() => {
    updateLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '👑'; // Gold crown for 1st place
      case 1: return '🥈'; // Silver medal for 2nd place
      case 2: return '🥉'; // Bronze medal for 3rd place
      default: return `#${index + 1}`; // Number for other places
    }
  };

  const getRankColors = (index: number) => {
    switch (index) {
      case 0: return 'from-yellow-400 to-orange-500 border-yellow-500/50'; // Gold
      case 1: return 'from-gray-300 to-gray-400 border-gray-400/50'; // Silver
      case 2: return 'from-orange-400 to-orange-600 border-orange-500/50'; // Bronze
      default: return 'from-purple-500 to-blue-500 border-purple-500/30'; // Default purple theme
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 py-8">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-8 h-12 bg-yellow-500 rounded-full opacity-10 blur-sm"></div>
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <div className="w-6 h-10 bg-silver-400 rounded-full opacity-10 blur-sm"></div>
        </div>
        <div className="absolute bottom-40 left-20 animate-float-slow">
          <div className="w-7 h-11 bg-orange-500 rounded-full opacity-10 blur-sm"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-yellow-400 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-4 tracking-tight">
            LEADERBOARD
          </h1>
          <div className="w-48 h-1 bg-gradient-to-r from-yellow-500 via-purple-500 to-blue-500 mx-auto rounded-full animate-pulse mb-6"></div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            The ultimate ColorStark champions who have mastered the art of color matching
          </p>
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto">
          {leaderboard.length === 0 ? (
            <div className="text-center">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold text-white mb-4">No Players Yet</h3>
                <p className="text-gray-400">Be the first to join the leaderboard and claim your spot!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((player, index) => (
                <div
                  key={player.address}
                  className={`
                    leaderboard-entry group relative overflow-hidden
                    bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10
                    hover:bg-white/10 hover:border-white/20 transition-all duration-300
                    ${index < 3 ? 'transform hover:scale-[1.02]' : 'hover:translate-x-2'}
                  `}
                >
                  {/* Rank indicator gradient */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getRankColors(index).split(' ').slice(0, 2).join(' ')}`}></div>
                  
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-6">
                      {/* Rank */}
                      <div className={`
                        w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold text-white
                        bg-gradient-to-r ${getRankColors(index)}
                        shadow-lg transform transition-transform duration-300 group-hover:scale-110
                      `}>
                        {getRankIcon(index)}
                      </div>
                      
                      {/* Player Info */}
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {player.name || 'Unnamed Player'}
                        </h3>
                        <p className="text-gray-400 text-sm font-mono">
                          {player.address.slice(0, 8)}...{player.address.slice(-6)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Points */}
                    <div className="text-right">
                      <div className="text-3xl font-black text-white mb-1">
                        {player.points}
                      </div>
                      <div className="text-sm text-gray-400">
                        {player.points === '1' ? 'point' : 'points'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Shine effect for top 3 */}
                  {index < 3 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {leaderboard.length}
              </div>
              <div className="text-gray-400">Total Players</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {leaderboard.reduce((sum, player) => sum + parseInt(player.points || '0'), 0)}
              </div>
              <div className="text-gray-400">Total Points</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {leaderboard.length > 0 ? Math.max(...leaderboard.map(p => parseInt(p.points || '0'))) : 0}
              </div>
              <div className="text-gray-400">High Score</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 