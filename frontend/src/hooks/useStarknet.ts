import { useState, useEffect, useCallback } from 'react';
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

// New event interfaces for type safety
export interface GameEvent {
  player: string;
  game_id: string;
  timestamp: number;
}

export interface GameStartedEvent extends GameEvent {
  starting_bottles: number[];
  target_bottles: number[];
}

export interface MoveMadeEvent extends GameEvent {
  bottle_from: number;
  bottle_to: number;
  moves: number;
  correct_bottles: number;
}

export interface GameCompletedEvent extends GameEvent {
  final_moves: number;
  points_earned: string;
  total_points: string;
}

// Helper function to decode felt252 names
function decodePlayerName(nameRes: any): string {
  let decodedName = 'Unnamed';
  const nameString = String(nameRes);
  if (nameRes && nameString !== '0' && nameString !== '') {
    try {
      const decoded = shortString.decodeShortString(nameString);
      if (decoded && decoded.trim() && decoded !== '\x00') {
        decodedName = decoded;
      }
    } catch (decodeError) {
      // Keep default 'Unnamed' if decoding fails
    }
  }
  return decodedName;
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
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [isListeningToEvents, setIsListeningToEvents] = useState(false);

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

  // Event listening function
  const setupEventListeners = useCallback(async () => {
    if (!contract || !address || isListeningToEvents) return;

    try {
      setIsListeningToEvents(true);
      
      // Listen to player's game events
      const eventFilter = {
        fromBlock: 'latest',
        toBlock: 'latest',
        address: contractAddress,
        keys: [address] // Filter by player address
      };

      console.log('Setting up event listeners for player:', address);
      
      // This is a conceptual implementation - actual Starknet event listening
      // would use the specific Starknet.js event subscription methods
      
    } catch (error) {
      console.error('Error setting up event listeners:', error);
      setIsListeningToEvents(false);
    }
  }, [contract, address, isListeningToEvents, contractAddress]);

  // Handle different event types
  const handleGameStartedEvent = useCallback((event: any) => {
    console.log('Game Started Event:', event);
    const gameEvent: GameStartedEvent = {
      player: event.player,
      game_id: uint256.uint256ToBN(event.game_id).toString(),
      starting_bottles: event.starting_bottles.map(parseColorFromContract),
      target_bottles: event.target_bottles.map(parseColorFromContract),
      timestamp: Date.now()
    };
    
    // Update game state immediately
    setGameId(gameEvent.game_id);
    setGameState({
      player: gameEvent.player,
      bottles: gameEvent.starting_bottles,
      target: gameEvent.target_bottles,
      moves: 0,
      isActive: true
    });
    
    setGameEvents(prev => [...prev, gameEvent]);
  }, []);

  const handleMoveMadeEvent = useCallback((event: any) => {
    console.log('Move Made Event:', event);
    const moveEvent: MoveMadeEvent = {
      player: event.player,
      game_id: uint256.uint256ToBN(event.game_id).toString(),
      bottle_from: Number(event.bottle_from),
      bottle_to: Number(event.bottle_to),
      moves: Number(event.moves),
      correct_bottles: Number(event.correct_bottles),
      timestamp: Date.now()
    };
    
    // Update game state and progress immediately
    setCorrectBottles(moveEvent.correct_bottles);
    setGameState(prev => prev ? { ...prev, moves: moveEvent.moves } : null);
    
    setGameEvents(prev => [...prev, moveEvent]);
  }, []);

  const handleGameCompletedEvent = useCallback((event: any) => {
    console.log('Game Completed Event:', event);
    const completedEvent: GameCompletedEvent = {
      player: event.player,
      game_id: uint256.uint256ToBN(event.game_id).toString(),
      final_moves: Number(event.final_moves),
      points_earned: uint256.uint256ToBN(event.points_earned).toString(),
      total_points: uint256.uint256ToBN(event.total_points).toString(),
      timestamp: Date.now()
    };
    
    // Update player points and game state immediately
    setPlayerPoints(completedEvent.total_points);
    setGameState(prev => prev ? { ...prev, isActive: false } : null);
    setGameId(null);
    
    // Update leaderboard
    updateLeaderboard();
    
    setGameEvents(prev => [...prev, completedEvent]);
  }, []);

  const handleGameEndedEvent = useCallback((event: any) => {
    console.log('Game Ended Event:', event);
    
    // Clear current game
    setGameId(null);
    setGameState(null);
    setCorrectBottles(0);
    
    setGameEvents(prev => [...prev, {
      player: event.player,
      game_id: uint256.uint256ToBN(event.game_id).toString(),
      timestamp: Date.now()
    }]);
  }, []);

  async function updatePlayerData(account: any) {
    if (account && contract && address) {
      try {
        const pointsRes = await contract.call('get_player_points', [address]);
        const points = Array.isArray(pointsRes) ? pointsRes[0] : pointsRes;
        setPlayerPoints(uint256.uint256ToBN(points as any).toString());
        
        const nameRes = await contract.call('get_player_name', [address]);
        setPlayerName(decodePlayerName(nameRes));
        
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
          name: decodePlayerName(player.name),
          points: player.points ? uint256.uint256ToBN(player.points).toString() : '0',
        }));
        setLeaderboard(formatted.sort((a, b) => Number(b.points) - Number(a.points)));
      } catch (error) {
        console.error('Error updating leaderboard:', error);
        setLeaderboard([]);
      }
    }
  }

  function parseColorFromContract(colorObj: any): number {
    if (typeof colorObj === 'object' && colorObj !== null) {
      if (colorObj.Red !== undefined) return 0;
      if (colorObj.Blue !== undefined) return 1;
      if (colorObj.Green !== undefined) return 2;
      if (colorObj.Yellow !== undefined) return 3;
      if (colorObj.Purple !== undefined) return 4;
    }
    return 0; // Default to Red if parsing fails
  }

  async function updateGameState(gameId: string | null) {
    if (contract && gameId) {
      try {
        const gameIdUint256 = uint256.bnToUint256(BigInt(gameId));
        const state: any = await contract.call('get_game_state', [gameIdUint256]);
        
        if (!Array.isArray(state) || state.length < 5) {
          throw new Error('Invalid game state response');
        }
        
        // Parse the game state according to the contract structure
        setGameState({
          player: String(state[0]),
          bottles: Array.isArray(state[1]) ? state[1].map(parseColorFromContract) : [],
          target: Array.isArray(state[2]) ? state[2].map(parseColorFromContract) : [],
          moves: Number(state[3]) || 0,
          isActive: state[4]?.True !== undefined,
        });
        
        // Get correct bottles count
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

  async function findActiveGame(): Promise<string | null> {
    if (!account || !contract || !address) return null;
    
    try {
      // Use the new smart contract function to get active game directly
      const activeGameId = await contract.call('get_player_active_game', [address]);
      const gameIdString = uint256.uint256ToBN(activeGameId as any).toString();
      
      // Return the game ID if it's not 0 (which means no active game)
      return gameIdString !== '0' ? gameIdString : null;
    } catch (error) {
      console.error('Error finding active game:', error);
      return null;
    }
  }

  async function checkActiveGame() {
    const activeGameId = await findActiveGame();
    if (activeGameId) {
      setGameId(activeGameId);
      await updateGameState(activeGameId);
    } else {
      setGameId(null);
      setGameState(null);
    }
  }

  async function hasActiveGame(): Promise<boolean> {
    if (!account || !contract || !address) return false;
    
    try {
      const hasActive = await contract.call('has_active_game', [address]);
      return Boolean(hasActive);
    } catch (error) {
      console.error('Error checking if player has active game:', error);
      return false;
    }
  }

  async function getNextGameId(): Promise<string> {
    if (!contract) return '1';
    
    try {
      const nextId = await contract.call('get_next_game_id', []);
      return uint256.uint256ToBN(nextId as any).toString();
    } catch (error) {
      console.error('Error getting next game ID:', error);
      return '1';
    }
  }

  useEffect(() => {
    if (account && contract && address) {
      updatePlayerData(account);
      checkActiveGame();
      setupEventListeners();
    }
  }, [account, contract, address, setupEventListeners]);

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
    gameEvents,
    isListeningToEvents,
    updatePlayerData,
    updateLeaderboard,
    updateGameState,
    findActiveGame,
    hasActiveGame,
    getNextGameId,
    setupEventListeners,
    handleGameStartedEvent,
    handleMoveMadeEvent,
    handleGameCompletedEvent,
    handleGameEndedEvent,
  };
}