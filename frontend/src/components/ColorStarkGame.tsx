import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, Square, Eye, EyeOff } from 'lucide-react';
import BottlesBackground from './BottlesBackground';
import { useAccount } from "@starknet-react/core";
import { useRouter } from "next/navigation";
import { Contract, shortString, Provider } from "starknet";
import colorStarkAbi from "../abi/color_stark.json";
import { useGameCompletedListener } from '../hooks/useGameCompletedListener';
import { useTargetRevealLockout } from "../hooks/useTargetRevealLockout";
import Bottle from "./Bottle";
import CongratsMessage from "./CongratsMessage";
import InstructionsModal from "./InstructionsModal";

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
  const router = useRouter();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "";
  const provider = new Provider({ nodeUrl: rpcUrl });
  const [playerName, setPlayerName] = useState('');
  const [tempName, setTempName] = useState('');
  const [points, setPoints] = useState(0);
  const {
    showTarget,
    handleShowTarget,
    targetRevealLocked,
    targetRevealCountdown,
    resetTargetRevealLockout,
  }: {
    showTarget: boolean;
    handleShowTarget: () => void;
    targetRevealLocked: boolean;
    targetRevealCountdown: number;
    resetTargetRevealLockout: () => void;
  } = useTargetRevealLockout();
  const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
  const [onchainGameId, setOnchainGameId] = useState<string | null>(null);
  const [loadingGame, setLoadingGame] = useState<boolean>(false);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [nameTxStatus, setNameTxStatus] = useState<null | 'pending' | 'success' | 'error'>(null);
  const [nameTxError, setNameTxError] = useState<string | null>(null);
  const [gameTxStatus, setGameTxStatus] = useState<null | 'pending' | 'success' | 'error'>(null);
  const [gameTxError, setGameTxError] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [bottles, setBottles] = useState<BottleColor[]>([]);
  const [target, setTarget] = useState<BottleColor[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Helper function to parse Color enum from contract
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

  // Helper function to count bottles
  function countCorrectBottles(bottles: BottleColor[], target: BottleColor[]) {
    let correct = 0;
    for (let i = 0; i < bottles.length; i++) {
      if (bottles[i] === target[i]) correct++;
    }
    return correct;
  }

  // Helper function to check if bottles match the target
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
      localStorage.removeItem("colorstark_player_points");
      return;
    }
    const storedName = localStorage.getItem("colorstark_player_name");
    const storedPoints = localStorage.getItem("colorstark_player_points");
    if (storedName && storedPoints) {
      setPlayerName(storedName);
      setPoints(Number(storedPoints));
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
          const points = Number(Array.isArray(pointsRaw) ? pointsRaw[0] : pointsRaw);
          setPoints(points);
          localStorage.setItem("colorstark_player_points", points.toString());
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
        setMoves(0); 
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

  
  const submitResult = async () => {
    if (!contract || !onchainGameId || !gameActive) return;
    setTxLoading(true);
    setGameTxStatus('pending');
    setGameTxError(null);
    
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
      setGameTxStatus('success');
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
          const points = Number(Array.isArray(pts) ? pts[0] : pts);
          setPoints(points);
          localStorage.setItem("colorstark_player_points", points.toString());
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
      setGameTxStatus('error');
      setGameTxError(errorMessage);
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
          const points = Number(Array.isArray(pts) ? pts[0] : pts);
          setPoints(points);
          localStorage.setItem("colorstark_player_points", points.toString());
        } catch {}
      }
      localStorage.removeItem('colorstark_active_game_id');
      setTimeout(() => setShowCongrats(false), 5000);
    }
  });

  // Auto-dismiss nameTxStatus after 5s
  useEffect(() => {
    if (nameTxStatus && nameTxStatus !== 'pending') {
      const timer = setTimeout(() => {
        setNameTxStatus(null);
        setNameTxError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [nameTxStatus]);

  // Auto-dismiss gameTxStatus after 5s
  useEffect(() => {
    if (gameTxStatus && gameTxStatus !== 'pending') {
      const timer = setTimeout(() => {
        setGameTxStatus(null);
        setGameTxError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameTxStatus]);

  // Reset target reveal lockout on new game or submission
  useEffect(() => {
    resetTargetRevealLockout();
  }, [onchainGameId, gameTxStatus === 'success']);

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {showInstructions && (
        <InstructionsModal open={showInstructions} onClose={() => setShowInstructions(false)} />
      )}
      {showCongrats && (
        <CongratsMessage points={10} />
      )}
      <BottlesBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 bg-clip-text text-transparent tracking-tight">Color</h1>
            <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-blue-400 via-teal-400 to-green-400 bg-clip-text text-transparent tracking-tight">Stark</h1>
            {/* Sparkle icon */}
            <span className="ml-2 animate-pulse text-yellow-300 text-2xl sm:text-3xl">✨</span>
          </div>
          <p className="text-lg sm:text-xl text-gray-300 text-center">Match the colors, earn the points!</p>
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
                  disabled={!address || nameTxStatus === 'pending'}
                  maxLength={31}
                />
                <button
                  onClick={async () => {
                    if (!tempName.trim() || !address || !contract || tempName.length > 31) return;
                    try {
                      setNameTxStatus('pending');
                      setNameTxError(null);
                      setFetchError(null);
                      const nameFelt = shortString.encodeShortString(tempName.trim());
                      await contract.invoke('set_player_name', [nameFelt]);
                      setPlayerName(tempName);
                      localStorage.setItem("colorstark_player_name", tempName);
                      setTempName('');
                      setNameTxStatus('success');
                    } catch (err: any) {
                      setNameTxStatus('error');
                      setNameTxError(err.message || 'Transaction failed');
                      setFetchError('Failed to set name on chain.');
                    }
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
                  disabled={!address || nameTxStatus === 'pending' || !tempName.trim() || tempName.length > 31}
                >
                  {nameTxStatus === 'pending' ? 'Setting...' : 'Set'}
                </button>
              </div>
              {tempName.length > 31 && (
                <p className="text-red-400 text-sm">Name must be 31 characters or less.</p>
              )}
              {fetchError && <p className="text-red-400 text-sm">{fetchError}</p>}
              {nameTxStatus === 'pending' && <p className="text-yellow-400 text-sm">Transaction pending...</p>}
              {nameTxStatus === 'success' && <p className="text-green-400 text-sm">Name set on-chain!</p>}
              {nameTxStatus === 'error' && <p className="text-red-400 text-sm">{nameTxError || 'Transaction failed'}</p>}
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
                    onClick={() => router.push("/")}
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
                    onClick={handleShowTarget}
                    disabled={targetRevealLocked}
                    className={
                      `flex items-center gap-1 transition-colors ` +
                      (targetRevealLocked
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-300 hover:text-blue-200')
                    }
                  >
                    {showTarget ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showTarget
                      ? 'Hide Target'
                      : (targetRevealLocked)
                        ? `Show Target (${targetRevealCountdown}s)`
                        : 'Show Target'}
                  </button>
                </div>
              </div>
              {/* Current Bottles */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-4">Your Bottles</h3>
                <div className="flex justify-center">
                  {bottles.map((color, index) => (
                    <Bottle
                      key={index}
                      color={color as BottleColor}
                      index={index}
                      isSelected={selectedBottle === index}
                      onClick={() => handleBottleClick(index)}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-300 mt-2">Click two bottles to swap them</p>
                <button
                  onClick={submitResult}
                  disabled={txLoading || !bottlesMatchTarget(bottles, target) || gameTxStatus === 'pending'}
                  className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {gameTxStatus === 'pending' ? 'Submitting...' : 'Submit Result'}
                </button>
                {!bottlesMatchTarget(bottles, target) && (
                  <p className="text-yellow-400 text-sm mt-2">Arrange the bottles to match the target before submitting!</p>
                )}
                {gameTxStatus === 'error' && <p className="text-red-400 text-sm mt-2">{gameTxError || 'Transaction failed'}</p>}
                {gameTxStatus === 'success' && !txLoading && <p className="text-green-400 text-sm mt-2">Game Verified!</p>}
              </div>
              {/* Target Bottles */}
              {showTarget && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Target Configuration</h3>
                  <div className="flex justify-center">
                    {target.map((color, index) => (
                      <Bottle
                        key={index}
                        color={color as BottleColor}
                        index={index}
                        isTarget={true}
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