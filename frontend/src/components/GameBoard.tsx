'use client';

import { useState, useCallback } from 'react';
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

interface BottleProps {
  color: number;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  isDragOver: boolean;
  onBottleClick: (index: number) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (index: number) => void;
}

const Bottle = ({ 
  color, 
  index, 
  isSelected, 
  isCorrect, 
  isDragOver,
  onBottleClick,
  onDragStart,
  onDragOver,
  onDrop
}: BottleProps) => {
  const colorInfo = colorMap[color];
  
  return (
    <div className="relative group">
      {/* Bottle Container */}
      <div
        className={`
          relative w-20 h-32 cursor-pointer transition-all duration-300 transform
          ${isSelected ? 'scale-110 rotate-2' : 'hover:scale-105'}
          ${isDragOver ? 'scale-110 rotate-1' : ''}
        `}
        draggable
        onClick={() => onBottleClick(index)}
        onDragStart={() => onDragStart(index)}
        onDragOver={onDragOver}
        onDrop={() => onDrop(index)}
      >
        {/* Selection Ring */}
        {isSelected && (
          <div className="absolute -inset-2 rounded-full bg-yellow-400/30 animate-pulse"></div>
        )}
        
        {/* Correct Position Indicator */}
        {isCorrect && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Bottle Body */}
        <div className="relative w-full h-full">
          {/* Bottle Neck */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-gray-200 rounded-t-lg border-2 border-gray-300 shadow-inner"></div>
          
          {/* Bottle Cap */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-800 rounded-t-full border border-gray-600"></div>
          
          {/* Main Bottle */}
          <div 
            className={`
              absolute top-6 w-full h-24 rounded-t-3xl rounded-b-lg
              border-2 border-white/30 shadow-lg
              bg-gradient-to-b from-white/20 to-transparent
              overflow-hidden
            `}
            style={{ 
              backgroundColor: colorInfo.hex,
              boxShadow: `0 8px 32px ${colorInfo.hex}40, inset 0 2px 8px rgba(255,255,255,0.3)`
            }}
          >
            {/* Liquid Effect */}
            <div 
              className="absolute bottom-0 w-full h-5/6 rounded-b-lg animate-pulse"
              style={{ 
                background: `linear-gradient(180deg, ${colorInfo.hex}E6 0%, ${colorInfo.hex} 100%)`
              }}
            ></div>
            
            {/* Bottle Highlight */}
            <div className="absolute top-2 left-2 w-2 h-8 bg-white/40 rounded-full blur-sm"></div>
            
            {/* Bottle Label */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white/80 drop-shadow-lg">
              {colorInfo.name}
            </div>
          </div>
        </div>
        
        {/* Drag Over Effect */}
        {isDragOver && (
          <div className="absolute inset-0 border-4 border-dashed border-yellow-400 rounded-3xl animate-pulse"></div>
        )}
      </div>
      
      {/* Bottle Shadow */}
      <div 
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 rounded-full opacity-30 blur-sm"
        style={{ backgroundColor: colorInfo.hex }}
      ></div>
    </div>
  );
};

export default function GameBoard({ account, contract, gameId, gameState, correctBottles, updatePlayerData, updateGameState }: GameBoardProps) {
  const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
  const [draggedBottle, setDraggedBottle] = useState<number | null>(null);
  const [dragOverBottle, setDragOverBottle] = useState<number | null>(null);
  const [isProcessingMove, setIsProcessingMove] = useState(false);

  const handleBottleClick = useCallback(async (bottleIndex: number) => {
    if (!account || !contract || !gameId || !gameState.isActive || isProcessingMove) return;
    
    if (selectedBottle === null) {
      setSelectedBottle(bottleIndex);
    } else if (selectedBottle === bottleIndex) {
      setSelectedBottle(null); // Deselect if clicking the same bottle
    } else {
      await makeMove(selectedBottle, bottleIndex);
    }
  }, [account, contract, gameId, gameState.isActive, selectedBottle, isProcessingMove]);

  const handleDragStart = useCallback((bottleIndex: number) => {
    setDraggedBottle(bottleIndex);
    setSelectedBottle(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((bottleIndex: number) => {
    setDragOverBottle(bottleIndex);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverBottle(null);
  }, []);

  const handleDrop = useCallback(async (bottleIndex: number) => {
    if (draggedBottle !== null && draggedBottle !== bottleIndex) {
      await makeMove(draggedBottle, bottleIndex);
    }
    setDraggedBottle(null);
    setDragOverBottle(null);
  }, [draggedBottle]);

  const makeMove = async (fromIndex: number, toIndex: number) => {
    if (!account || !contract || !gameId) return;
    
    setIsProcessingMove(true);
    try {
      await contract.invoke('make_move', [gameId, fromIndex, toIndex]);
      setSelectedBottle(null);
      await updateGameState(gameId);
      await updatePlayerData(account);
    } catch (error) {
      console.error('Error making move:', error);
    } finally {
      setIsProcessingMove(false);
    }
  };

  const getBottleCorrectness = (index: number) => {
    return gameState.bottles[index] === gameState.target[index];
  };

  const progressPercentage = Math.round((correctBottles / gameState.bottles.length) * 100);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Bottle Laboratory</h2>
          <p className="text-gray-300">Match the target arrangement by switching bottles</p>
        </div>
        
        {/* Game Stats */}
        <div className="text-right">
          <div className="text-2xl font-bold text-white mb-1">{gameState.moves} Moves</div>
          <div className="text-sm text-gray-400">Progress: {progressPercentage}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Bottles in Correct Position</span>
          <span className="text-sm text-white font-bold">{correctBottles}/{gameState.bottles.length}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Current Bottles */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
            Your Bottles
            {selectedBottle !== null && (
              <span className="ml-4 text-sm bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
                Click another bottle to swap
              </span>
            )}
          </h3>
          <div 
            className="flex gap-6 justify-center p-6 bg-white/5 rounded-2xl border border-white/10"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {gameState.bottles.map((color, index) => (
              <div 
                key={index}
                onDragEnter={() => handleDragEnter(index)}
                onDrop={() => handleDrop(index)}
              >
                <Bottle
                  color={color}
                  index={index}
                  isSelected={selectedBottle === index}
                  isCorrect={getBottleCorrectness(index)}
                  isDragOver={dragOverBottle === index}
                  onBottleClick={handleBottleClick}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Target Arrangement */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
            Target Arrangement
          </h3>
          <div className="flex gap-6 justify-center p-6 bg-green-500/10 rounded-2xl border border-green-500/20">
            {gameState.target.map((color, index) => (
              <div key={index} className="relative">
                <Bottle
                  color={color}
                  index={index}
                  isSelected={false}
                  isCorrect={false}
                  isDragOver={false}
                  onBottleClick={() => {}}
                  onDragStart={() => {}}
                  onDragOver={() => {}}
                  onDrop={() => {}}
                />
                {/* Target Position Number */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
        <h4 className="text-lg font-bold text-white mb-3">How to Play:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <span><strong>Click:</strong> Select a bottle, then click another to swap</span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <span><strong>Drag & Drop:</strong> Drag bottles to rearrange them</span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <span><strong>Goal:</strong> Match the target arrangement exactly</span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
            <span><strong>Efficiency:</strong> Complete in fewer moves for higher score</span>
          </div>
        </div>
      </div>

      {/* Processing Overlay */}
      {isProcessingMove && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white font-medium">Processing move...</span>
          </div>
        </div>
      )}
    </div>
  );
}