'use client';

import { useState } from 'react';
import { Contract } from 'starknet';
import { AccountInterface } from 'starknet';
import { feltToString } from '../utils';

interface PlayerInfoProps {
  account: AccountInterface | null;
  contract: Contract | null;
  playerName: string;
  playerPoints: string;
  updatePlayerData: (account: AccountInterface) => Promise<void>;
  updateLeaderboard: () => Promise<void>;
}

export default function PlayerInfo({ account, contract, playerName, playerPoints, updatePlayerData, updateLeaderboard }: PlayerInfoProps) {
  const [newName, setNewName] = useState('');

  async function handleSetName() {
    if (!account || !contract || !newName) return;
    try {
      const nameFelt = BigInt(newName.split('').map(c => c.charCodeAt(0)).join(''));
      await contract.call('set_player_name', [nameFelt]);
      setNewName('');
      await updatePlayerData(account);
      await updateLeaderboard();
    } catch (error) {
      console.error('Error setting name:', error);
    }
  }

  return (
    <div className="mb-4">
      <p className="text-lg">Player: {playerName} ({account?.address.slice(0, 6)}...)</p>
      <p className="text-lg">Points: {playerPoints}</p>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Enter your name"
          className="border p-2 rounded"
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleSetName}
        >
          Set Name
        </button>
      </div>
    </div>
  );
}