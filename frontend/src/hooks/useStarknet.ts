import { useState, useEffect } from 'react';
import { useAccount } from '@starknet-react/core';
import { Provider, Contract, uint256, shortString } from 'starknet';
import { colorMap } from '../utils';
import colorStarkAbi from '../abi/color_stark.json';

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://free-rpc.nethermind.io/sepolia-juno';

export interface GameState {
  player: string;
  bottles: number[];
  target: number[];
  moves: number;
  isActive: boolean;
}

export interface PlayerData {
  address: string;
  name: string;
  points: string;
}

export function useStarknet() {
  const { account, address } = useAccount();
  const [contract, setContract] = useState<Contract | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [correctBottles, setCorrectBottles] = useState(0);
  const [playerPoints, setPlayerPoints] = useState('0');
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<PlayerData[]>([]);

  // Create contract when account is connected
  useEffect(() => {
    if (account && contractAddress) {
      try {
        const starknetContract = new Contract(
          colorStarkAbi as any,
          contractAddress,
          account
        );
        setContract(starknetContract);
      } catch (error) {
        console.error('Error creating contract:', error);
        setContract(null);
      }
    } else {
      setContract(null);
    }
  }, [account]);

  async function updatePlayerData(account: any) {
    if (account && contract && address) {
      try {
        const pointsRes = await contract.call('get_player_points', [address]);
        const points = Array.isArray(pointsRes) ? pointsRes[0] : pointsRes;
        setPlayerPoints(uint256.uint256ToBN(points as any).toString());
        
        const nameRes = await contract.call('get_player_name', [address]);
        setPlayerName(nameRes ? shortString.decodeShortString(String(nameRes)) : 'Unnamed');
        
        await updateLeaderboard();
      } catch (error) {
        console.error('Error updating player data:', error);
        setPlayerPoints('0');
        setPlayerName('Unnamed');
      }
    }
  }

  async function updateLeaderboard() {
    if (contract) {
      try {
        const playersRes = await contract.call('get_all_player_points', []);
        const playersArray = Array.isArray(playersRes) ? playersRes : [];
        const formatted: PlayerData[] = playersArray.map((player: any) => ({
          address: player.address || '',
          name: player.name ? shortString.decodeShortString(String(player.name)) : 'Unnamed',
          points: player.points ? uint256.uint256ToBN(player.points).toString() : '0',
        }));
        setLeaderboard(formatted.sort((a, b) => Number(b.points) - Number(a.points)));
      } catch (error) {
        console.error('Error updating leaderboard:', error);
        setLeaderboard([]);
      }
    }
  }

  async function updateGameState(gameId: string | null) {
    if (contract && gameId) {
      try {
        const gameIdUint256 = uint256.bnToUint256(BigInt(gameId));
        const state: any = await contract.call('get_game_state', [gameIdUint256]);
        
        if (!Array.isArray(state) || state.length < 5) {
          throw new Error('Invalid game state response');
        }
        
        setGameState({
          player: String(state[0]),
          bottles: Array.isArray(state[1]) ? state[1].map((color: any) => {
            if (color.Red !== undefined) return 0;
            if (color.Blue !== undefined) return 1;
            if (color.Green !== undefined) return 2;
            if (color.Yellow !== undefined) return 3;
            if (color.Purple !== undefined) return 4;
            return 0;
          }) : [],
          target: Array.isArray(state[2]) ? state[2].map((color: any) => {
            if (color.Red !== undefined) return 0;
            if (color.Blue !== undefined) return 1;
            if (color.Green !== undefined) return 2;
            if (color.Yellow !== undefined) return 3;
            if (color.Purple !== undefined) return 4;
            return 0;
          }) : [],
          moves: Number(state[3]) || 0,
          isActive: state[4]?.True !== undefined,
        });
        
        const correct = await contract.call('get_correct_bottles', [gameIdUint256]);
        setCorrectBottles(Number(correct) || 0);
      } catch (error) {
        console.error('Error updating game state:', error);
        setGameState(null);
        setCorrectBottles(0);
      }
    } else {
      setGameState(null);
      setCorrectBottles(0);
    }
  }

  async function checkActiveGame() {
    if (account && contract && address) {
      try {
        let latestGameId = gameId ? BigInt(gameId) : BigInt(1);
        let found = false;
        
        // Check for active games
        for (let i = 0; i < 10; i++) {
          try {
            const testGameId = (latestGameId + BigInt(i)).toString();
            const gameIdUint256 = uint256.bnToUint256(BigInt(testGameId));
            const state: any = await contract.call('get_game_state', [gameIdUint256]);
            
            if (Array.isArray(state) && 
                state.length >= 5 && 
                state[4]?.True !== undefined && 
                String(state[0]) === address) {
              setGameId(testGameId);
              await updateGameState(testGameId);
              found = true;
              break;
            }
          } catch (gameError) {
            // Game doesn't exist or other error, continue checking
            console.log(`Game ${latestGameId + BigInt(i)} not found or error:`, gameError);
            continue;
          }
        }
        
        if (!found) {
          setGameId(null);
          setGameState(null);
        }
      } catch (error) {
        console.error('Error checking active game:', error);
        setGameId(null);
        setGameState(null);
      }
    }
  }

  useEffect(() => {
    if (account && contract && address) {
      updatePlayerData(account);
      checkActiveGame();
    }
  }, [account, contract, address]);

  return {
    account,
    contract,
    gameId,
    setGameId,
    gameState,
    setGameState,
    correctBottles,
    playerPoints,
    playerName,
    leaderboard,
    updatePlayerData,
    updateLeaderboard,
    updateGameState,
  };
}