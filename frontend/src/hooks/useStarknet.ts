import { useState, useEffect } from 'react';
import { connect } from 'starknetkit';
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
  const [account, setAccount] = useState<any | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [correctBottles, setCorrectBottles] = useState(0);
  const [playerPoints, setPlayerPoints] = useState('0');
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<PlayerData[]>([]);

  async function connectWallet() {
    try {
      const { wallet } = await connect({
        modalMode: 'canAsk',
        webWalletUrl: 'https://web.argent.xyz',
      });
      if (wallet && wallet.account && wallet.account.address) {
        setAccount(wallet);
        const provider = new Provider({ rpc: { nodeUrl: rpcUrl } });
        const starknetContract = new Contract(
          colorStarkAbi,
          contractAddress,
          provider
        );
        starknetContract.connect(wallet);
        setContract(starknetContract);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  }

  async function updatePlayerData(account: any) {
    if (account && contract) {
      try {
        const pointsRes = await contract.call('get_player_points', [account.address]);
        setPlayerPoints(uint256.uint256ToBN(pointsRes).toString());
        const nameRes = await contract.call('get_player_name', [account.address]);
        setPlayerName(nameRes ? shortString.decodeShortString(nameRes) : 'Unnamed');
        await updateLeaderboard();
      } catch (error) {
        console.error('Error updating player data:', error);
      }
    }
  }

  async function updateLeaderboard() {
    if (contract) {
      try {
        const playersRes = await contract.call('get_all_player_points', []);
        const formatted: PlayerData[] = playersRes.map((player: any) => ({
          address: player.address,
          name: player.name ? shortString.decodeShortString(player.name) : 'Unnamed',
          points: uint256.uint256ToBN(player.points).toString(),
        }));
        setLeaderboard(formatted.sort((a, b) => Number(b.points) - Number(a.points)));
      } catch (error) {
        console.error('Error updating leaderboard:', error);
      }
    }
  }

  async function updateGameState(gameId: string | null) {
    if (contract && gameId) {
      try {
        const state = await contract.call('get_game_state', [uint256.bnToUint256(BigInt(gameId))]);
        setGameState({
          player: state[0],
          bottles: state[1].map((color: any) => {
            if (color.Red !== undefined) return 0;
            if (color.Blue !== undefined) return 1;
            if (color.Green !== undefined) return 2;
            if (color.Yellow !== undefined) return 3;
            if (color.Purple !== undefined) return 4;
            return 0;
          }),
          target: state[2].map((color: any) => {
            if (color.Red !== undefined) return 0;
            if (color.Blue !== undefined) return 1;
            if (color.Green !== undefined) return 2;
            if (color.Yellow !== undefined) return 3;
            if (color.Purple !== undefined) return 4;
            return 0;
          }),
          moves: Number(state[3]),
          isActive: state[4].True !== undefined,
        });
        const correct = await contract.call('get_correct_bottles', [uint256.bnToUint256(BigInt(gameId))]);
        setCorrectBottles(Number(correct));
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
    if (account && contract) {
      try {
        let latestGameId = gameId ? BigInt(gameId) : BigInt(1);
        let found = false;
        for (let i = 0; i < 10; i++) {
          const testGameId = (latestGameId + BigInt(i)).toString();
          const state = await contract.call('get_game_state', [uint256.bnToUint256(BigInt(testGameId))]);
          if (state[4].True !== undefined && state[0] === account.address) {
            setGameId(testGameId);
            await updateGameState(testGameId);
            found = true;
            break;
          }
        }
        if (!found) {
          setGameId(null);
          setGameState(null);
        }
      } catch (error) {
        console.error('Error checking active game:', error);
      }
    }
  }

  useEffect(() => {
    if (account && contract) {
      updatePlayerData(account);
      checkActiveGame();
    }
  }, [account, contract]);

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
    connectWallet,
    updatePlayerData,
    updateLeaderboard,
    updateGameState,
  };
}