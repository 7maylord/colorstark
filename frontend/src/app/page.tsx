'use client';

import { useStarknet } from '../hooks/useStarknet';
import WalletConnector from '../components/WalletConnector';
import PlayerInfo from '../components/PlayerInfo';
import GameControls from '../components/GameControls';
import GameBoard from '../components/GameBoard';
import Leaderboard from '../components/Leaderboard';

export default function Home() {
  const { account, contract, gameId, setGameId, gameState, setGameState, correctBottles, playerPoints, playerName, updatePlayerData, updateLeaderboard, updateGameState } = useStarknet();

  return (
    <div className="container mx-auto p-4 max-w-4xl bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-4">Color Bottle Matching Game</h1>
      <WalletConnector />
      {account && (
        <div>
          <PlayerInfo
            account={account}
            contract={contract}
            playerName={playerName}
            playerPoints={playerPoints}
            updatePlayerData={updatePlayerData}
            updateLeaderboard={updateLeaderboard}
          />
          <GameControls
            account={account}
            contract={contract}
            gameState={gameState}
            gameId={gameId}
            setGameId={setGameId}
            updateGameState={updateGameState}
          />
          {gameState && (
            <GameBoard
              account={account}
              contract={contract}
              gameId={gameId}
              gameState={gameState}
              correctBottles={correctBottles}
              updateGameState={updateGameState}
              updatePlayerData={updatePlayerData}
            />
          )}
          <Leaderboard />
        </div>
      )}
    </div>
  );
}