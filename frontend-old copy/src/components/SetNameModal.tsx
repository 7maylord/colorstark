'use client';

import { useState } from 'react';
import { shortString } from 'starknet';
import { useStarknet } from '@/hooks/useStarknet';

interface SetNameModalProps {
  onClose: () => void;
  onNameSet: () => void;
}

export default function SetNameModal({ onClose, onNameSet }: SetNameModalProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { contract, account, updatePlayerData } = useStarknet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a name');
      return;
    }

    if (name.length > 31) {
      setError('Name must be 31 characters or less (felt252 limit)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (contract && account) {
        // Convert name to felt252 using starknet shortString utility
        const nameFelt = shortString.encodeShortString(name.trim());
        
        await contract.invoke('set_player_name', [nameFelt]);
        
        // Wait a moment for the transaction to process
        setTimeout(async () => {
          await updatePlayerData(account);
          onNameSet();
        }, 2000);
      }
    } catch (error) {
      console.error('Error setting name:', error);
      setError('Failed to set name. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🎮</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Choose Your Gamer Tag</h2>
          <p className="text-purple-100 text-sm">This name will be displayed on the leaderboard</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="playerName" className="block text-white font-medium mb-3">
                Player Name
              </label>
              <div className="relative">
                <input
                  id="playerName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={31}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-all duration-200 disabled:opacity-50"
                />
                <div className="absolute right-3 top-3 text-gray-400 text-sm">
                  {name.length}/31
                </div>
              </div>
              {error && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              )}
            </div>

            {/* Tips */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <h4 className="text-blue-400 font-medium mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Name Guidelines
              </h4>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• 31 characters maximum</li>
                <li>• Choose something memorable</li>
                <li>• Names are stored on the blockchain</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:hover:from-purple-600 disabled:hover:to-blue-600 shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Setting Name...
                  </div>
                ) : (
                  'Set Name'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-xl p-6 text-center">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white font-medium">Saving to blockchain...</p>
              <p className="text-gray-400 text-sm mt-1">Please wait</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 