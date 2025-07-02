'use client';

import { useState } from 'react';
import { Contract } from 'starknet';
import { AccountInterface } from 'starknet';
import { colorMap } from '../utils';
import { GameState } from '../hooks/useStarknet';

interface GameBoardProps {
  account: AccountInterface | null;
  contract: Contract | null;
  gameId: string | null;
  gameState: GameState;
  correctBottles: number;
  updateGameState: (gameId: string | null) => Promise<void>;
  updatePlayerData: (account: AccountInterface) => Promise<void>;
}

export default function GameBoard({ account, contract, gameId, gameState, correctBottles, updatePlayerData, updateGameState }: GameBoardProps) {
  const [selectedBottle, setSelectedBottle] = useState<number | null>(null);

  async function handleMove(bottleIndex: number) {
    if (!account || !contract || !gameId || !gameState.isActive) return;
    if (selectedBottle === null) {
      setSelectedBottle(bottleIndex);
    } else {
      try {
        await contract.invoke('make_move', [gameId, selectedBottle, bottleIndex]);
        setSelectedBottle(null);
        await updateGameState(gameId);
        await updatePlayerData(account);
      } catch (error) {
        console.error('Error making move:', error);
      }
    }
  }

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold">Game State</h2>
      <p>Moves: {gameState.moves}</p>
      <p>Correct Bottles: {correctBottles}/5</p>
      <div className="flex gap-4 mt-2">
        <div>
          <h3 className="font-semibold">Current Bottles:</h3>
          <div className="flex gap-2">
            {gameState.bottles.map((color, index) => (
              <div
                key={index}
                className={`w-16 h-16 rounded ${selectedBottle === index ? 'border-4 border-yellow-500' : 'border'}`}
                style={{ backgroundColor: colorMap[color].hex }}
                onClick={() => handleMove(index)}
              ></div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Target:</h3>
          <div className="flex gap-2">
            {gameState.target.map((color, index) => (
              <div
                key={index}
                className="w-16 h-16 rounded border"
                style={{ backgroundColor: colorMap[color].hex }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}