'use client';

import { useState, useCallback, useEffect } from 'react';
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

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'celebration';
  duration?: number;
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
          ${isSelected ? 'scale-110 rotate-2 z-10' : 'hover:scale-105'}
          ${isDragOver ? 'scale-110 rotate-1' : ''}
          ${isCorrect ? 'animate-pulse' : ''}
        `}
        draggable
        onClick={() => onBottleClick(index)}
        onDragStart={() => onDragStart(index)}
        onDragOver={onDragOver}
        onDrop={() => onDrop(index)}
      >
        {/* Selection Ring */}
        {isSelected && (
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-50 animate-pulse">
            <div className="absolute inset-1 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 opacity-30 animate-ping"></div>
          </div>
        )}
        
        {/* Correct Position Indicator */}
        {isCorrect && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center animate-bounce shadow-lg">
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
              ${isSelected ? 'shadow-2xl shadow-yellow-500/30' : ''}
            `}
            style={{ 
              backgroundColor: colorInfo.hex,
              boxShadow: `0 8px 32px ${colorInfo.hex}40, inset 0 2px 8px rgba(255,255,255,0.3)`
            }}
          >
            {/* Liquid Effect */}
            <div 
              className="absolute bottom-0 w-full h-5/6 rounded-b-lg"
              style={{ 
                background: `linear-gradient(180deg, ${colorInfo.hex}E6 0%, ${colorInfo.hex} 100%)`
              }}
            >
              {/* Liquid Animation */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white/30 rounded-full animate-pulse"></div>
            </div>
            
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
          <div className="absolute inset-0 border-4 border-dashed border-yellow-400 rounded-3xl animate-pulse bg-yellow-400/10"></div>
        )}
        
        {/* Click Effect */}
        {isSelected && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-yellow-400 text-xs font-bold animate-bounce">
              Selected!
            </div>
          </div>
        )}
      </div>
      
      {/* Bottle Shadow */}
      <div 
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 rounded-full opacity-30 blur-sm"
        style={{ backgroundColor: colorInfo.hex }}
      ></div>
      
      {/* Position Number */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-bold border border-gray-500">
        {index + 1}
      </div>
    </div>
  );
};

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: ToastMessage['type']; onClose: () => void }) => {
  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400';
      case 'celebration':
        return 'bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white border-purple-400';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400';
      case 'warning':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400';
      default:
        return 'bg-gray-800 text-white border-gray-600';
    }
  };

  return (
    <div className={`
      fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
      ${getToastStyles()}
      px-6 py-4 rounded-2xl border-2 shadow-2xl
      animate-bounce backdrop-blur-sm
      flex items-center space-x-3
    `}>
      {type === 'celebration' && <span className="text-2xl">🎉</span>}
      {type === 'success' && <span className="text-xl">✅</span>}
      {type === 'info' && <span className="text-xl">💡</span>}
      {type === 'warning' && <span className="text-xl">⚠️</span>}
      
      <span className="font-bold text-lg">{message}</span>
      
      <button 
        onClick={onClose}
        className="ml-2 text-white/70 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default function GameBoard({ account, contract, gameId, gameState, correctBottles, updatePlayerData, updateGameState }: GameBoardProps) {
  const [selectedBottle, setSelectedBottle] = useState<number | null>(null);
  const [draggedBottle, setDraggedBottle] = useState<number | null>(null);
  const [dragOverBottle, setDragOverBottle] = useState<number | null>(null);
  const [isProcessingMove, setIsProcessingMove] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastCorrectBottles, setLastCorrectBottles] = useState(correctBottles);
  const [moveHistory, setMoveHistory] = useState<Array<{from: number, to: number, move: number}>>([]);

  // Show toast for correct moves
  useEffect(() => {
    if (correctBottles > lastCorrectBottles) {
      const improvement = correctBottles - lastCorrectBottles;
      let message = '';
      let type: ToastMessage['type'] = 'success';

      if (correctBottles === 5) {
        message = '🎉 Perfect! All bottles in position! 🎉';
        type = 'celebration';
      } else if (improvement > 1) {
        message = `Great! +${improvement} bottles in correct position!`;
        type = 'success';
      } else {
        message = 'Nice move! +1 bottle in correct position!';
        type = 'success';
      }

      showToast(message, type, 3000);
    } else if (correctBottles < lastCorrectBottles) {
      const decrease = lastCorrectBottles - correctBottles;
      showToast(`Oops! -${decrease} bottle(s) moved out of position`, 'warning', 2000);
    }
    setLastCorrectBottles(correctBottles);
  }, [correctBottles, lastCorrectBottles]);

  const showToast = (message: string, type: ToastMessage['type'] = 'info', duration: number = 3000) => {
    const id = Date.now().toString();
    const toast: ToastMessage = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleBottleClick = useCallback(async (bottleIndex: number) => {
    if (!account || !contract || !gameId || !gameState.isActive || isProcessingMove) return;
    
    if (selectedBottle === null) {
      setSelectedBottle(bottleIndex);
      showToast(`Bottle ${bottleIndex + 1} selected! Click another bottle to swap.`, 'info', 2000);
    } else if (selectedBottle === bottleIndex) {
      setSelectedBottle(null);
      showToast('Selection cleared!', 'info', 1500);
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
    showToast(`Swapping bottles ${fromIndex + 1} ↔ ${toIndex + 1}...`, 'info', 2000);
    
    try {
      await contract.invoke('make_move', [gameId, fromIndex, toIndex]);
      
      // Add to move history
      setMoveHistory(prev => [...prev, { 
        from: fromIndex, 
        to: toIndex, 
        move: gameState.moves + 1 
      }]);
      
      setSelectedBottle(null);
      await updateGameState(gameId);
      await updatePlayerData(account);
      
      showToast(`Move completed! Bottles ${fromIndex + 1} and ${toIndex + 1} swapped.`, 'success', 2000);
    } catch (error) {
      console.error('Error making move:', error);
      showToast('Move failed! Please try again.', 'warning', 3000);
    } finally {
      setIsProcessingMove(false);
    }
  };

  const getBottleCorrectness = (index: number) => {
    return gameState.bottles[index] === gameState.target[index];
  };

  const progressPercentage = Math.round((correctBottles / gameState.bottles.length) * 100);

  return (
    <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
      {/* Toast Messages */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
            🧪 Bottle Laboratory
            {gameState.isActive && (
              <span className="ml-3 text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 animate-pulse">
                Game Active
              </span>
            )}
          </h2>
          <p className="text-gray-300">Match the target arrangement by switching bottles</p>
        </div>
        
        {/* Game Stats */}
        <div className="text-right">
          <div className="text-2xl font-bold text-white mb-1 flex items-center justify-end space-x-2">
            <span className="text-purple-400">⚡</span>
            <span>{gameState.moves} Moves</span>
          </div>
          <div className="text-sm text-gray-400">Progress: {progressPercentage}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Bottles in Correct Position
          </span>
          <span className="text-sm text-white font-bold bg-gradient-to-r from-purple-500 to-green-500 bg-clip-text text-transparent">
            {correctBottles}/{gameState.bottles.length}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden border border-gray-600">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-green-500 transition-all duration-700 ease-out relative"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Current Bottles */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></span>
            Your Bottles
            {selectedBottle !== null && (
              <span className="ml-4 text-sm bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full border border-yellow-500/30 animate-bounce">
                Click another bottle to swap!
              </span>
            )}
          </h3>
          <div 
            className="flex gap-6 justify-center p-6 bg-white/5 rounded-2xl border border-white/10 min-h-[200px] items-center"
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
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></span>
            Target Arrangement
            <span className="ml-3 text-sm text-green-400">🎯 Goal</span>
          </h3>
          <div className="flex gap-6 justify-center p-6 bg-green-500/10 rounded-2xl border border-green-500/20 min-h-[200px] items-center">
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
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Move History */}
      {moveHistory.length > 0 && (
        <div className="mt-8 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <h4 className="text-lg font-bold text-white mb-3 flex items-center">
            📜 Move History
          </h4>
          <div className="flex flex-wrap gap-2">
            {moveHistory.slice(-5).map((move, index) => (
              <span 
                key={index}
                className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30"
              >
                #{move.move}: {move.from + 1} ↔ {move.to + 1}
              </span>
            ))}
            {moveHistory.length > 5 && (
              <span className="text-sm text-gray-400 px-3 py-1">
                +{moveHistory.length - 5} more...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
        <h4 className="text-lg font-bold text-white mb-3 flex items-center">
          🎮 How to Play:
        </h4>
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
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl flex items-center justify-center z-40">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center space-x-4 border border-white/20">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white font-medium">Processing move...</span>
          </div>
        </div>
      )}
    </div>
  );
}