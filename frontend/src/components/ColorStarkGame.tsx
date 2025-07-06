import React, { useState, useEffect } from 'react';
import { Wallet, Trophy, Users, Play, RotateCw, Square, Eye, EyeOff } from 'lucide-react';
import BottlesBackground from './BottlesBackground';

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
  const [gameId, setGameId] = useState(null);
  const [moves, setMoves] = useState(0);
  const [points, setPoints] = useState(0);
  const [showTarget, setShowTarget] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState(null);
  const [animatingBottles, setAnimatingBottles] = useState(new Set());
  // Game state
  const [currentBottles, setCurrentBottles] = useState(['Red', 'Blue', 'Green', 'Yellow', 'Purple']);
  const [targetBottles, setTargetBottles] = useState(['Purple', 'Yellow', 'Green', 'Blue', 'Red']);
  const [correctBottles, setCorrectBottles] = useState(0);

  // Shuffle array function
  const shuffleArray = (array) => {
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

  const setName = () => {
    if (tempName.trim()) {
      setPlayerName(tempName);
      setTempName('');
    }
  };

  const startGame = () => {
    const shuffledStart = shuffleArray(mockColors);
    const shuffledTarget = shuffleArray(mockColors);
    setCurrentBottles(shuffledStart);
    setTargetBottles(shuffledTarget);
    setIsInGame(true);
    setGameId(Date.now());
    setMoves(0);
    setSelectedBottle(null);
    setCorrectBottles(0);
  };

  const endGame = () => {
    setIsInGame(false);
    setGameId(null);
    setMoves(0);
    setSelectedBottle(null);
  };

  const handleBottleClick = async (index) => {
    if (!isInGame || animatingBottles.has(index)) return;
    if (selectedBottle === null) {
      setSelectedBottle(index);
    } else if (selectedBottle === index) {
      setSelectedBottle(null);
    } else {
      // Swap bottles with animation
      setAnimatingBottles(new Set([selectedBottle, index]));
      setTimeout(() => {
        const newBottles = [...currentBottles];
        [newBottles[selectedBottle], newBottles[index]] = [newBottles[index], newBottles[selectedBottle]];
        setCurrentBottles(newBottles);
        setMoves(prev => prev + 1);
        setSelectedBottle(null);
        setAnimatingBottles(new Set());
      }, 300);
    }
  };

  const BottleComponent = ({ color, index, isTarget = false, isSelected = false, onClick }: {
    color: keyof typeof colorMap,
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
                />
                <button
                  onClick={setName}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Set
                </button>
              </div>
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
                {!isInGame ? (
                  <button
                    onClick={startGame}
                    disabled={!playerName}
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    Start Game
                  </button>
                ) : (
                  <button
                    onClick={endGame}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-5 h-5" />
                    End Game
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Game Board */}
        {isInGame && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gray-500 bg-opacity-10 backdrop-blur-sm rounded-xl p-8 border border-white border-opacity-20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Game #{gameId}</h2>
                <div className="flex justify-center gap-6 text-sm">
                  <span>Moves: {moves}</span>
                  <span>Correct: {correctBottles}/5</span>
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
                  {currentBottles.map((color, index) => (
                    <BottleComponent
                      key={index}
                      color={color}
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
                    {targetBottles.map((color, index) => (
                      <BottleComponent
                        key={index}
                        color={color}
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