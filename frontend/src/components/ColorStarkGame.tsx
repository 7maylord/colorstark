import React, { useState, useEffect } from 'react';
import { Wallet, Trophy, Users, Play, RotateCw, Square, Eye, EyeOff } from 'lucide-react';
import BottlesBackground from './BottlesBackground';
import { useAccount } from "@starknet-react/core";
import { Contract, shortString, Provider } from "starknet";
import colorStarkAbi from "../abi/color_stark.json";

// Mock data for demonstration
const mockColors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple'];
const colorMap = {
  Red: 'bg-red-500',
  Blue: 'bg-blue-500', 
  Green: 'bg-green-500',
  Yellow: 'bg-yellow-500',
  Purple: 'bg-purple-500'
};



const ColorStarkGame = () => {
  const [playerName, setPlayerName] = useState('');
  const [tempName, setTempName] = useState('');
  const [isInGame, setIsInGame] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [points, setPoints] = useState(0);
  const [showTarget, setShowTarget] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
  const [animatingBottles, setAnimatingBottles] = useState(new Set());
  // Game state
  const [currentBottles, setCurrentBottles] = useState(['Red', 'Blue', 'Green', 'Yellow', 'Purple']);
  const [targetBottles, setTargetBottles] = useState(['Purple', 'Yellow', 'Green', 'Blue', 'Red']);
  const [correctBottles, setCorrectBottles] = useState(0);
  const { account, address } = useAccount();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
  const [txStatus, setTxStatus] = useState<null | 'pending' | 'success' | 'error'>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // Add new state for on-chain game
  const [onchainGameId, setOnchainGameId] = useState<string | null>(null);
  const [onchainBottles, setOnchainBottles] = useState<BottleColor[]>([]);
  const [onchainTarget, setOnchainTarget] = useState<BottleColor[]>([]);
  const [onchainMoves, setOnchainMoves] = useState<number>(0);
  const [onchainActive, setOnchainActive] = useState<boolean>(false);
  const [onchainCorrect, setOnchainCorrect] = useState<number>(0);
  const [loadingGame, setLoadingGame] = useState<boolean>(false);
  const [txLoading, setTxLoading] = useState<boolean>(false);


  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "";
  const provider = new Provider({ nodeUrl: rpcUrl });

  // Shuffle array function
  const shuffleArray = (array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Calculate correct bottles
  useEffect(() => {
    const correct = currentBottles.reduce((acc, bottle, index) => {
      return acc + (bottle === targetBottles[index] ? 1 : 0);
    }, 0);
    setCorrectBottles(correct);
    // Check if game is won
    if (correct === 5 && isInGame) {
      setTimeout(() => {
        setPoints(prev => prev + 10);
        setIsInGame(false);
        setGameId(null);
        setMoves(0);
        alert('Congratulations! You won 10 points!');
      }, 500);
    }
  }, [currentBottles, targetBottles, isInGame]);

  // Create contract instance when account changes
  useEffect(() => {
    if (account && contractAddress) {
      setContract(new Contract(colorStarkAbi as any, contractAddress, account));
    } else {
      setContract(null);
    }
  }, [account, contractAddress]);

  // On mount or address change, try to load the player name from localStorage and set it. If not found, fetch from chain.
  useEffect(() => {
   
    if (!address) {
      setPlayerName("");
      setFetchError(null);
      localStorage.removeItem("colorstark_player_name");
      return;
    }
    const storedName = localStorage.getItem("colorstark_player_name");
    if (storedName) {
      setPlayerName(storedName);
      setFetchError(null);
    } else if (contractAddress && address) {
      (async () => {
        try {
          const readContract = new Contract(colorStarkAbi as any, contractAddress, provider);
          
          const nameFelt = await readContract.call("get_player_name", [address]);
          let name = "";
          try {
            if (typeof nameFelt === "bigint") {
              name = shortString.decodeShortString(nameFelt.toString());
            } else if (nameFelt && typeof nameFelt === "object" && "toString" in nameFelt) {
              name = shortString.decodeShortString(nameFelt.toString());
            } else if (typeof nameFelt === "string") {
              name = shortString.decodeShortString(nameFelt);
            } else {
            }
          } catch (decodeErr) {
            console.error("[ColorStarkGame] Error decoding nameFelt:", decodeErr, nameFelt);
          }
          if (name) {
            setPlayerName(name);
            localStorage.setItem("colorstark_player_name", name);
            setFetchError(null);
          } else {
            setPlayerName("");
            setFetchError("No name found. Please set your player name.");
          }
        } catch (err: any) {
          console.error('[ColorStarkGame] get_player_name error:', err);
          setPlayerName("");
          setFetchError("Failed to fetch name from chain. Please set your player name.");
        }
      })();
    }
  }, [address, contractAddress]);

  // Set name on-chain
  const setName = async () => {
    if (!tempName.trim() || !address || !contract) return;
    try {
      setTxStatus('pending');
      setTxError(null);
      setFetchError(null);
      const nameFelt = shortString.encodeShortString(tempName.trim());
      await contract.invoke('set_player_name', [nameFelt]);
      setPlayerName(tempName);
      localStorage.setItem("colorstark_player_name", tempName);
      setTempName('');
      setTxStatus('success');
    } catch (err: any) {
      setTxStatus('error');
      setTxError(err.message || 'Transaction failed');
      setFetchError('Failed to set name on chain.');
    }
  };

  // Helper to parse Color enum from contract
  function parseColor(colorObj: any): BottleColor {
    if (typeof colorObj === 'object' && colorObj !== null) {
      if (colorObj.Red !== undefined) return 'Red';
      if (colorObj.Blue !== undefined) return 'Blue';
      if (colorObj.Green !== undefined) return 'Green';
      if (colorObj.Yellow !== undefined) return 'Yellow';
      if (colorObj.Purple !== undefined) return 'Purple';
    }
    return 'Red';
  }

  // Fetch on-chain game state
  const fetchOnchainGame = async (gameId: string) => {
    setLoadingGame(true);
    try {
      console.log("[fetchOnchainGame] Using contractAddress:", contractAddress, "provider:", provider, "gameId:", gameId);
      const readContract = new Contract(colorStarkAbi as any, contractAddress, provider);
      const state = await readContract.call("get_game_state", [gameId]);
      console.log("[fetchOnchainGame] get_game_state result:", state);
      // Support both array and object-with-numeric-keys return types
      const stateArr = Array.isArray(state)
        ? state
        : typeof state === "object" && state !== null
          ? Object.values(state)
          : [];
      if (stateArr && stateArr.length >= 5) {
        const bottles = Array.isArray(stateArr[1]) ? stateArr[1].map(parseColor) : [];
        const target = Array.isArray(stateArr[2]) ? stateArr[2].map(parseColor) : [];
        setOnchainBottles(bottles);
        setOnchainTarget(target);
        setOnchainMoves(Number(stateArr[3]));
        setOnchainActive(Boolean(stateArr[4]));
        // get correct count
        const correct = await readContract.call("get_correct_bottles", [gameId]);
        console.log("[fetchOnchainGame] get_correct_bottles result:", correct);
        setOnchainCorrect(Number(correct));
      } else {
        console.warn("[fetchOnchainGame] Unexpected state structure:", state);
        setOnchainBottles([]);
        setOnchainTarget([]);
        setOnchainMoves(0);
        setOnchainActive(false);
        setOnchainCorrect(0);
      }
    } catch (err) {
      console.error("[ColorStarkGame] fetchOnchainGame error:", err, "contractAddress:", contractAddress, "provider:", provider, "gameId:", gameId);
      setOnchainBottles([]);
      setOnchainTarget([]);
      setOnchainMoves(0);
      setOnchainActive(false);
      setOnchainCorrect(0);
    }
    setLoadingGame(false);
  };

  // On page load, check for active game
  useEffect(() => {
    if (!address) {
      setOnchainGameId(null);
      setOnchainBottles([]);
      setOnchainTarget([]);
      setOnchainMoves(0);
      setOnchainActive(false);
      setOnchainCorrect(0);
      localStorage.removeItem("colorstark_active_game_id");
      return;
    }
    (async () => {
      setLoadingGame(true);
      try {
        const readContract = new Contract(colorStarkAbi as any, contractAddress, provider);
        // Ensure address is a string
        const playerAddress = typeof address === 'string' ? address : String(address);
        const gameIdRaw = await readContract.call("get_player_active_game", [playerAddress]);
        let idStr = null;
        if (Array.isArray(gameIdRaw) && gameIdRaw.length > 0) {
          idStr = typeof gameIdRaw[0] === 'bigint' ? gameIdRaw[0].toString() : String(gameIdRaw[0]);
        } else if (typeof gameIdRaw === 'bigint') {
          idStr = gameIdRaw.toString();
        } else if (typeof gameIdRaw === 'string') {
          idStr = gameIdRaw;
        }
        if (idStr && idStr !== '0') {
          setOnchainGameId(idStr);
          localStorage.setItem("colorstark_active_game_id", idStr);
          await fetchOnchainGame(idStr);
        } else {
          setOnchainGameId(null);
          setOnchainBottles([]);
          setOnchainTarget([]);
          setOnchainMoves(0);
          setOnchainActive(false);
          setOnchainCorrect(0);
          localStorage.removeItem("colorstark_active_game_id");
        }
      } catch (err) {
        setOnchainGameId(null);
        setOnchainBottles([]);
        setOnchainTarget([]);
        setOnchainMoves(0);
        setOnchainActive(false);
        setOnchainCorrect(0);
        localStorage.removeItem("colorstark_active_game_id");
      }
      setLoadingGame(false);
    })();
  }, [address, contractAddress]);

  // Start game on-chain
  const startGame = async () => {
    if (!contract || !address) return;
    // Check for existing active game in localStorage
    const localGameId = localStorage.getItem("colorstark_active_game_id");
    if (localGameId && localGameId !== "0") {
      setOnchainGameId(localGameId);
      await fetchOnchainGame(localGameId);
      return;
    }
    setTxLoading(true);
    try {
      await contract.invoke("start_game", []);
      // Wait a bit for tx to be confirmed (or poll for event)
      setTimeout(async () => {
        const readContract = new Contract(colorStarkAbi as any, contractAddress, provider);
        const playerAddress = typeof address === 'string' ? address : String(address);
        const gameIdRaw = await readContract.call("get_player_active_game", [playerAddress]);
        let idStr = null;
        if (Array.isArray(gameIdRaw) && gameIdRaw.length > 0) {
          idStr = typeof gameIdRaw[0] === 'bigint' ? gameIdRaw[0].toString() : String(gameIdRaw[0]);
        } else if (typeof gameIdRaw === 'bigint') {
          idStr = gameIdRaw.toString();
        } else if (typeof gameIdRaw === 'string') {
          idStr = gameIdRaw;
        }
        setOnchainGameId(idStr);
        if (idStr && idStr !== '0') {
          localStorage.setItem("colorstark_active_game_id", idStr);
        } else {
          localStorage.removeItem("colorstark_active_game_id");
        }
        if (idStr) await fetchOnchainGame(idStr);
        setTxLoading(false);
      }, 3000);
    } catch (err) {
      setTxLoading(false);
      console.error("[ColorStarkGame] startGame error:", err);
    }
  };

  // Make move on-chain
  const makeMove = async (from: number, to: number) => {
    if (!contract || !onchainGameId) return;
    setTxLoading(true);
    try {
      await contract.invoke("make_move", [onchainGameId, from, to]);
      setTimeout(async () => {
        await fetchOnchainGame(onchainGameId);
        setTxLoading(false);
      }, 2000);
    } catch (err) {
      setTxLoading(false);
      console.error("[ColorStarkGame] makeMove error:", err);
    }
  };

  // UI: use onchainBottles/onchainTarget if onchainGameId is set, else show nothing or prompt
  // Update handleBottleClick to use makeMove if onchainGameId is set
  const handleBottleClick = async (index: number) => {
    if (!onchainActive || txLoading || loadingGame) return;
    if (selectedBottle === null) {
      setSelectedBottle(index);
    } else if (selectedBottle === index) {
      setSelectedBottle(null);
    } else {
      await makeMove(selectedBottle, index);
      setSelectedBottle(null);
    }
  };

 
  type BottleColor = 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Purple';

  const BottleComponent = ({ color, index, isTarget = false, isSelected = false, onClick }: {
    color: BottleColor,
    index: number,
    isTarget?: boolean,
    isSelected?: boolean,
    onClick: (idx: number) => void
  }) => (
    <div
      className={`
        relative w-16 h-32 mx-2 cursor-pointer transition-all duration-300 transform
        ${isSelected ? 'scale-110 ring-4 ring-white ring-opacity-50' : ''}
        ${animatingBottles.has(index) ? 'scale-125' : ''}
        ${!isTarget && isInGame ? 'hover:scale-105' : ''}
      `}
      onClick={() => onClick && onClick(index)}
    >
      {/* Bottle neck */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-6 h-6 bg-gradient-to-b from-gray-200 to-gray-400 rounded-t-md z-20 border border-gray-300" />
      {/* Bottle cap */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-8 h-3 bg-gradient-to-b from-gray-700 to-gray-500 rounded-t-lg z-30 border border-gray-600" />
      {/* Bottle body (glass) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-4 w-12 h-24 bg-gradient-to-b from-white/80 via-white/30 to-white/10 rounded-b-2xl rounded-t-lg border-2 border-gray-200 shadow-xl z-10 overflow-hidden">
        {/* Liquid */}
        <div className={`absolute bottom-0 left-0 w-full h-3/4 ${colorMap[color]} rounded-b-2xl`} style={{ opacity: isTarget ? 0.7 : 1 }} />
        {/* Shine */}
        <div className="absolute left-2 top-4 w-2 h-12 bg-white bg-opacity-30 rounded-full rotate-12 z-20" />
      </div>
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center z-40">
          <Square className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      <BottlesBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            ColorStark
          </h1>
          <p className="text-xl text-gray-300">Match the colors, earn the points!</p>
        </div>
        {/* Name Input (always show) */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter your name"
                  className="flex-1 px-3 py-2 bg-gray-100 bg-opacity-20 rounded-lg text-black placeholder-gray-400 border border-black border-opacity-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={!address || txStatus === 'pending'}
                />
                <button
                  onClick={setName}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
                  disabled={!address || txStatus === 'pending' || !tempName.trim()}
                >
                  {txStatus === 'pending' ? 'Setting...' : 'Set'}
                </button>
              </div>
              {fetchError && <p className="text-red-400 text-sm">{fetchError}</p>}
              {txStatus === 'pending' && <p className="text-yellow-400 text-sm">Transaction pending...</p>}
              {txStatus === 'success' && <p className="text-green-400 text-sm">Name set on-chain!</p>}
              {txStatus === 'error' && <p className="text-red-400 text-sm">{txError || 'Transaction failed'}</p>}
              <div className="text-center">
                <p className="text-lg text-black font-semibold">{playerName}</p>
                <p className="text-sm text-gray-300">Points: {points}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Game Controls (only if playerName is set) */}
        {playerName && (
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-gray-100 bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20">
              <div className="flex gap-4">
                {!onchainActive ? (
                  <button
                    onClick={startGame}
                    disabled={!playerName || txLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {txLoading ? 'Starting...' : <Play className="w-5 h-5" />}
                    Start Game
                  </button>
                ) : (
                  <button
                    onClick={() => {}} // End game logic will be handled by onchain
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    disabled={txLoading}
                  >
                    {txLoading ? 'Ending...' : <RotateCw className="w-5 h-5" />}
                    End Game
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Game Board */}
        {onchainActive && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gray-500 bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Game #{onchainGameId}</h2>
                <div className="flex justify-center gap-6 text-sm">
                  <span>Moves: {onchainMoves}</span>
                  <span>Correct: {onchainCorrect}/5</span>
                  <button
                    onClick={() => setShowTarget(!showTarget)}
                    className="flex items-center gap-1 text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    {showTarget ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showTarget ? 'Hide Target' : 'Show Target'}
                  </button>
                </div>
              </div>
              {/* Current Bottles */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-4">Your Bottles</h3>
                <div className="flex justify-center">
                  {onchainBottles.map((color, index) => (
                    <BottleComponent
                      key={index}
                      color={color as BottleColor}
                      index={index}
                      isSelected={selectedBottle === index}
                      onClick={handleBottleClick}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-300 mt-2">Click two bottles to swap them</p>
              </div>
              {/* Target Bottles */}
              {showTarget && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Target Configuration</h3>
                  <div className="flex justify-center">
                    {onchainTarget.map((color, index) => (
                      <BottleComponent
                        key={index}
                        color={color as BottleColor}
                        index={index}
                        isTarget={true}
                        onClick={() => {}}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ColorStarkGame; 