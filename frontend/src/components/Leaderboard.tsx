'use client';

import { useStarknet } from '../hooks/useStarknet';

export default function Leaderboard() {
  const { leaderboard } = useStarknet();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Rank</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((player, index) => (
            <tr key={player.address}>
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{player.name}</td>
              <td className="border p-2">{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}