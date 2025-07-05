'use client';

import React from 'react';
import { useStarknet, GameEvent, GameStartedEvent, MoveMadeEvent, GameCompletedEvent } from '../hooks/useStarknet';
import { colorMap } from '../utils';

interface GameEventFeedProps {
  maxEvents?: number;
}

export default function GameEventFeed({ maxEvents = 10 }: GameEventFeedProps) {
  const { gameEvents, isListeningToEvents } = useStarknet();

  const formatEventMessage = (event: GameEvent): string => {
    const eventType = getEventType(event);
    const playerShort = `${event.player.slice(0, 6)}...${event.player.slice(-4)}`;
    
    switch (eventType) {
      case 'GameStarted':
        return `🎮 ${playerShort} started a new game!`;
      
      case 'MoveMade':
        const moveEvent = event as MoveMadeEvent;
        return `🔄 ${playerShort} made move ${moveEvent.moves} (${moveEvent.correct_bottles}/5 correct)`;
      
      case 'GameCompleted':
        const completedEvent = event as GameCompletedEvent;
        return `🎉 ${playerShort} completed game in ${completedEvent.final_moves} moves! (+${completedEvent.points_earned} points)`;
      
      case 'GameEnded':
        return `❌ ${playerShort} ended their game`;
      
      default:
        return `📝 ${playerShort} performed an action`;
    }
  };

  const getEventType = (event: GameEvent): string => {
    if ('starting_bottles' in event) return 'GameStarted';
    if ('bottle_from' in event) return 'MoveMade';
    if ('final_moves' in event) return 'GameCompleted';
    return 'GameEnded';
  };

  const getEventIcon = (event: GameEvent): string => {
    const eventType = getEventType(event);
    switch (eventType) {
      case 'GameStarted': return '🎮';
      case 'MoveMade': return '🔄';
      case 'GameCompleted': return '🎉';
      case 'GameEnded': return '❌';
      default: return '📝';
    }
  };

  const getEventColor = (event: GameEvent): string => {
    const eventType = getEventType(event);
    switch (eventType) {
      case 'GameStarted': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'MoveMade': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'GameCompleted': return 'bg-green-50 border-green-200 text-green-800';
      case 'GameEnded': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const renderEventDetails = (event: GameEvent) => {
    const eventType = getEventType(event);
    
    if (eventType === 'GameStarted') {
      const startEvent = event as GameStartedEvent;
      return (
        <div className="mt-2 flex space-x-1">
          <span className="text-xs text-gray-600">Starting:</span>
                     {startEvent.starting_bottles.map((color, idx) => (
             <div
               key={idx}
               className="w-4 h-4 rounded-full border border-gray-300"
               style={{ backgroundColor: colorMap[color]?.hex }}
               title={`Bottle ${idx + 1}: ${colorMap[color]?.name}`}
             />
           ))}
        </div>
      );
    }

    if (eventType === 'MoveMade') {
      const moveEvent = event as MoveMadeEvent;
      return (
        <div className="mt-1 text-xs text-gray-600">
          Swapped bottles {moveEvent.bottle_from + 1} ↔ {moveEvent.bottle_to + 1}
          <div className="mt-1">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${(moveEvent.correct_bottles / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{moveEvent.correct_bottles}/5 correct</span>
          </div>
        </div>
      );
    }

    if (eventType === 'GameCompleted') {
      const completedEvent = event as GameCompletedEvent;
      return (
        <div className="mt-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Moves: {completedEvent.final_moves}</span>
            <span className="text-green-600 font-semibold">+{completedEvent.points_earned} pts</span>
          </div>
          <div className="text-xs text-gray-500">
            Total points: {completedEvent.total_points}
          </div>
        </div>
      );
    }

    return null;
  };

  const recentEvents = gameEvents
    .slice(-maxEvents)
    .reverse()
    .slice(0, maxEvents);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">Live Game Feed</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isListeningToEvents ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isListeningToEvents ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recentEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎮</div>
            <p>No recent game events</p>
            <p className="text-sm">Start playing to see live updates!</p>
          </div>
        ) : (
          recentEvents.map((event, index) => (
            <div
              key={`${event.game_id}-${event.timestamp}-${index}`}
              className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${getEventColor(event)}`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg">{getEventIcon(event)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">
                    {formatEventMessage(event)}
                  </p>
                  {renderEventDetails(event)}
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {recentEvents.length >= maxEvents && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Showing last {maxEvents} events
          </p>
        </div>
      )}
    </div>
  );
} 