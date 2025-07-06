import React, { useState, useEffect } from 'react';
import { Play, RotateCw, Square, Eye, EyeOff } from 'lucide-react';
import BottlesBackground from './BottlesBackground';
import { useAccount } from "@starknet-react/core";
import { Contract, shortString, Provider } from "starknet";
import colorStarkAbi from "../abi/color_stark.json";
import { useGameCompletedListener } from '../hooks/useGameCompletedListener';

const colorMap = {
  Red: 'bg-red-500',
  Blue: 'bg-blue-500', 
  Green: 'bg-green-500',
  Yellow: 'bg-yellow-500',
  Purple: 'bg-purple-500'
};

type BottleColor = 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Purple';

const ColorStarkGame = () => {
  const { account, address } = useAccount();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "";
  const provider = new Provider({ nodeUrl: rpcUrl });
  const [playerName, setPlayerName] = useState('');
  const [tempName, setTempName] = useState('');
  const [points, setPoints] = useState(0);
  const [showTarget, setShowTarget] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
  const [onchainGameId, setOnchainGameId] = useState<string | null>(null);
  const [loadingGame, setLoadingGame] = useState<boolean>(false);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<null | 'pending' | 'success' | 'error'>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);

  // --- 1. Add new local state for offchain bottles, target, moves, and gameActive ---
  const [bottles, setBottles] = useState<BottleColor[]>([]);
  const [target, setTarget] = useState<BottleColor[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);

  // Helper to parse Color enum from contract
  function parseColor(colorObj: any): BottleColor {
    const variant = colorObj?.variant ?? colorObj;
    if (variant && typeof variant === 'object') {
      if (variant.Red !== undefined) return 'Red';
      if (variant.Blue !== undefined) return 'Blue';
      if (variant.Green !== undefined) return 'Green';
      if (variant.Yellow !== undefined) return 'Yellow';
      if (variant.Purple !== undefined) return 'Purple';
    }
    return 'Red';
  }

  // Helper to count correct bottles
  function countCorrectBottles(bottles: BottleColor[], target: BottleColor[]) {
    let correct = 0;
    for (let i = 0; i < bottles.length; i++) {
      if (bottles[i] === target[i]) correct++;
    }
    return correct;
  }

  // Helper to check if bottles match the target
  function bottlesMatchTarget(bottles: BottleColor[], target: BottleColor[]) {
    if (bottles.length !== target.length) return false;
    for (let i = 0; i < bottles.length; i++) {
      if (bottles[i] !== target[i]) return false;
    }
    return true;
  }

  // Fetch both player name and points in parallel
  useEffect(() => {
    if (!address) {
      setPlayerName("");
      setPoints(0);
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
          const [nameFelt, pointsRaw] = await Promise.all([
            readContract.call("get_player_name", [address]),
            readContract.call("get_player_points", [address])
          ]);
          let name = "";
          try {
            if (typeof nameFelt === "bigint") {
              name = shortString.decodeShortString(nameFelt.toString());
            } else if (nameFelt && typeof nameFelt === "object" && "toString" in nameFelt) {
              name = shortString.decodeShortString(nameFelt.toString());
            } else if (typeof nameFelt === "string") {
              name = shortString.decodeShortString(nameFelt);
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
          setPoints(Number(Array.isArray(pointsRaw) ? pointsRaw[0] : pointsRaw));
        } catch (err: any) {
          console.error('[ColorStarkGame] get_player_name/points error:', err);
          setPlayerName("");
          setPoints(0);
          setFetchError("Failed to fetch name/points from chain. Please set your player name.");
        }
      })();
    }
  }, [address, contractAddress]);

  // Create contract instance when account changes
  useEffect(() => {
    if (account && contractAddress) {
      setContract(new Contract(colorStarkAbi as any, contractAddress, account));
    } else {
      setContract(null);
    }
  }, [account, contractAddress]);

  // --- 2. Refactor fetchOnchainGame to initialize local state for offchain play ---
  const fetchOnchainGame = async (gameId: string) => {
    setLoadingGame(true);
    try {
      const readContract = new Contract(colorStarkAbi as any, contractAddress, provider);
      const state = await readContract.call("get_game_state", [gameId]);
      const stateArr = Array.isArray(state)
        ? state
        : typeof state === "object" && state !== null
          ? Object.values(state)
          : [];
      if (stateArr && stateArr.length >= 5) {
        const bottlesArr = Array.isArray(stateArr[1]) ? stateArr[1].map(parseColor) : [];
        const targetArr = Array.isArray(stateArr[2]) ? stateArr[2].map(parseColor) : [];
        setBottles(bottlesArr);
        setTarget(targetArr);
        setMoves(0); // reset moves for new game
        setGameActive(Boolean(stateArr[4]));
        setOnchainGameId(gameId);
      } else {
        setBottles([]);
        setTarget([]);
        setMoves(0);
        setGameActive(false);
        setOnchainGameId(null);
      }
    } catch (err) {
      setBottles([]);
      setTarget([]);
      setMoves(0);
      setGameActive(false);
      setOnchainGameId(null);
    }
    setLoadingGame(false);
  };

  // On page load, check for active game
  useEffect(() => {
    if (!address) {
      setOnchainGameId(null);
      localStorage.removeItem("colorstark_active_game_id");
      return;
    }
    (async () => {
      setLoadingGame(true);
      try {
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
        if (idStr && idStr !== '0') {
          setOnchainGameId(idStr);
          localStorage.setItem("colorstark_active_game_id", idStr);
          await fetchOnchainGame(idStr);
        } else {
          setOnchainGameId(null);
          localStorage.removeItem("colorstark_active_game_id");
        }
      } catch (err) {
        setOnchainGameId(null);
        localStorage.removeItem("colorstark_active_game_id");
      }
      setLoadingGame(false);
    })();
  }, [address, contractAddress]);

  // --- 3. Refactor startGame to only start on-chain, then initialize local state ---
  const startGame = async () => {
    if (!contract || !address) return;
    setTxLoading(true);
    try {
      await contract.invoke("start_game", []);
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
        if (idStr && idStr !== '0') {
          await fetchOnchainGame(idStr);
          setGameActive(true);
        } else {
          setGameActive(false);
        }
        setTxLoading(false);
      }, 3000);
    } catch (err) {
      setTxLoading(false);
    }
  };

  // --- 4. Remove on-chain move logic and replace with offchain swap logic ---
  const handleBottleClick = (index: number) => {
    if (!gameActive || txLoading || loadingGame) return;
    if (selectedBottle === null) {
      setSelectedBottle(index);
    } else if (selectedBottle === index) {
      setSelectedBottle(null);
    } else {
      // Swap bottles in local state
      setBottles((prev) => {
        const newArr = [...prev];
        [newArr[selectedBottle], newArr[index]] = [newArr[index], newArr[selectedBottle]];
        return newArr;
      });
      setMoves((m) => m + 1);
      setSelectedBottle(null);
    }
  };

  // --- 5. Add submitResult function to call contract.submit_result ---
  const submitResult = async () => {
    if (!contract || !onchainGameId || !gameActive) return;
    setTxLoading(true);
    setTxStatus(null);
    setTxError(null);
    
    try {
      // Convert bottles to contract enum object format
      const colorToEnum = (color: BottleColor) => {
        switch (color) {
          case 'Red': return 0;
        case 'Blue': return 1;
        case 'Green': return 2;
        case 'Yellow': return 3;
        case 'Purple': return 4;
        default: return 0;
        }
      };
      const bottleEnums = bottles.map(colorToEnum);
    console.log('[submitResult] bottleEnums:', bottleEnums);
    
      
      console.log('[submitResult] Calling contract.invoke', [onchainGameId, bottleEnums, moves]);
      await contract.invoke('submit_result', [onchainGameId, bottleEnums, moves]);
      console.log('[submitResult] contract.invoke success');
      setTxStatus('success');
      setShowCongrats(true);
      setGameActive(false);
      setOnchainGameId(null);
      setBottles([]);
      setTarget([]);
      setMoves(0);
      // Update points
      if (contract && address) {
        try {
          const pts = await contract.call('get_player_points', [address]);
          console.log('[submitResult] Updated points:', pts);
          setPoints(Number(Array.isArray(pts) ? pts[0] : pts));
        } catch (err) {
          console.log('[submitResult] Error updating points:', err);
        }
      }
      setTimeout(() => setShowCongrats(false), 5000);
    } catch (err: any) {
      console.log('[submitResult] Error:', err);
      let errorMessage = 'Transaction failed';
      if (err.message.includes('Game not active')) {
        errorMessage = 'The game is not active.';
      } else if (err.message.includes('Final bottles do not match target')) {
        errorMessage = 'Your bottle arrangement does not match the target.';
      }
      setTxStatus('error');
      setTxError(errorMessage);
    }
    setTxLoading(false);
  };

  // Listen for onchain game completion
  useGameCompletedListener({
    contract,
    playerAddress: address,
    gameId: onchainGameId,
    onCompleted: async () => {
      setShowCongrats(true);
      if (contract && address) {
        try {
          const pts = await contract.call('get_player_points', [address]);
          setPoints(Number(Array.isArray(pts) ? pts[0] : pts));
        } catch {}
      }
      localStorage.removeItem('colorstark_active_game_id');
      setTimeout(() => setShowCongrats(false), 5000);
    }
  });

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
        ${!isTarget ? 'hover:scale-105' : ''}
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
      {showCongrats && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
          <div className="bg-white rounded-xl shadow-2xl p-8 text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h2>
            <p className="text-lg text-gray-800">You have earned <span className="font-bold text-purple-600">10 points</span>!</p>
          </div>
        </div>
      )}
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
                  onClick={async () => {
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
                  }}
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
                {!gameActive ? (
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
        {gameActive && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gray-500 bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Game #{onchainGameId}</h2>
                <div className="flex justify-center gap-6 text-sm">
                  <span>Moves: {moves}</span>
                  <span>Correct: {countCorrectBottles(bottles, target)}/{bottles.length}</span>
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
                  {bottles.map((color, index) => (
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
                <button
                  onClick={submitResult}
                  disabled={txLoading || !bottlesMatchTarget(bottles, target)}
                  className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {txLoading ? 'Submitting...' : 'Submit Result'}
                </button>
                {!bottlesMatchTarget(bottles, target) && (
                  <p className="text-yellow-400 text-sm mt-2">Arrange the bottles to match the target before submitting!</p>
                )}
                {txStatus === 'error' && <p className="text-red-400 text-sm mt-2">{txError || 'Transaction failed'}</p>}
                {txStatus === 'success' && !txLoading && <p className="text-green-400 text-sm mt-2">Game Verified!</p>}
              </div>
              {/* Target Bottles */}
              {showTarget && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Target Configuration</h3>
                  <div className="flex justify-center">
                    {target.map((color, index) => (
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