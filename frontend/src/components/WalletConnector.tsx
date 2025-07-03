'use client';

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { StarknetkitConnector, useStarknetkitConnectModal } from "starknetkit";
import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStarknet } from '@/hooks/useStarknet';

// Simple classNames utility
const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Modal component that uses Portal to render at document.body
function PortalModal({ children, isOpen, onClose }: { children: React.ReactNode; isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll when modal is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // Close on escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const modalRoot = document.body;

  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        zIndex: 999999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="animate-fade-in">
        {children}
      </div>
    </div>,
    modalRoot
  );
}

function WalletConnected() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const { playerName } = useStarknet();

  const shortenedAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  // Display name: show player name if it exists and isn't 'Unnamed', otherwise show shortened address
  const displayName = useMemo(() => {
    if (playerName && playerName !== 'Unnamed' && playerName.trim()) {
      return playerName;
    }
    return shortenedAddress;
  }, [playerName, shortenedAddress]);

  const copyToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setJustCopied(true);
      // Reset back to copy icon after 5 seconds
      setTimeout(() => {
        setJustCopied(false);
      }, 5000);
    }
  };

  if (!address) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          relative px-4 py-2.5 rounded-xl font-medium text-sm
          bg-gradient-to-r from-starknet-600 to-purple-600 
          hover:from-starknet-500 hover:to-purple-500
          text-white shadow-lg hover:shadow-purple-500/25
          border border-white/20 hover:border-white/30
          backdrop-blur-sm transition-all duration-300
          hover:scale-105 active:scale-95
          flex items-center space-x-2 group overflow-hidden
        "
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/20 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
        
        {/* Wallet icon */}
        <div className="relative z-10 w-5 h-5 bg-gradient-to-r from-white to-gray-200 rounded-md flex items-center justify-center">
          <svg className="w-3 h-3 text-starknet-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
        
        <span className="relative z-10 hidden sm:inline font-mono">
          {displayName}
        </span>
        <span className="relative z-10 sm:hidden font-mono">
          {address.slice(0, 4)}...
        </span>
        
        {/* Dropdown arrow */}
        <svg 
          className={`relative z-10 w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[60]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="
            absolute right-0 top-full mt-2 w-80 z-[70]
            bg-black/80 backdrop-blur-xl border border-white/20 
            rounded-2xl shadow-2xl shadow-purple-500/20
            animate-fade-in
          ">
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Wallet Connected</h3>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              
              {/* Address Display */}
              <div className="
                bg-white/5 border border-white/10 rounded-xl p-3
                hover:bg-white/10 transition-all duration-300 group cursor-pointer
              " onClick={copyToClipboard}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Wallet Address</p>
                    <p className="text-white font-mono text-sm break-all">{address}</p>
                  </div>
                  <button className={`
                    p-2 rounded-lg transition-all duration-300 group-hover:scale-110
                    ${justCopied 
                      ? 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30' 
                      : 'bg-white/10 hover:bg-white/20'
                    }
                  `}>
                    {justCopied ? (
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button className="
                  flex items-center justify-center space-x-2 p-3 rounded-xl
                  bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30
                  text-blue-200 hover:text-white transition-all duration-300
                  hover:scale-105 active:scale-95
                ">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm">View</span>
                </button>
                
                <button 
                  onClick={() => {
                    disconnect();
                    setIsOpen(false);
                  }}
                  className="
                    flex items-center justify-center space-x-2 p-3 rounded-xl
                    bg-red-500/20 hover:bg-red-500/30 border border-red-500/30
                    text-red-200 hover:text-white transition-all duration-300
                    hover:scale-105 active:scale-95
                  "
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm">Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ConnectWallet() {
  const { connectors, connect } = useConnect();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isModalOpen]);

  const handleConnect = async (connector: any) => {
    try {
      setIsConnecting(true);
      if (!connector.available()) {
        // Redirect to wallet installation
        window.open('https://www.starknet.io/en/ecosystem/wallets', '_blank');
        return;
      }
      await connect({ connector });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const walletIcons: Record<string, string> = {
    argentx: '🦊',
    braavos: '🛡️',
    defaultIcon: '💼'
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="
          relative px-6 py-2.5 rounded-xl font-medium text-sm
          bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 
          hover:from-purple-500 hover:via-pink-500 hover:to-blue-500
          text-white shadow-lg hover:shadow-purple-500/25
          border border-white/20 hover:border-white/30
          backdrop-blur-sm transition-all duration-300
          hover:scale-105 active:scale-95
          flex items-center space-x-2 group overflow-hidden
        "
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
        
        <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span className="relative z-10">Connect Wallet</span>
      </button>
      
      {/* Modal */}
      {isModalOpen && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)', // Changed from red to dark
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div 
            className="
              bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 
              rounded-2xl border border-white/20 shadow-2xl max-w-md w-full 
              overflow-hidden animate-slide-up
            "
            style={{ maxWidth: '400px', width: '100%' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors duration-300 hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-3xl">🎮</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connect to ColorStark</h2>
              <p className="text-purple-100 text-sm">Choose your preferred Starknet wallet</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {connectors.map((connector) => {
                const walletName = connector.id.charAt(0).toUpperCase() + connector.id.slice(1);
                const isAvailable = connector.available();
                const icon = walletIcons[connector.id.toLowerCase()] || walletIcons.defaultIcon;
                
                return (
                  <button
                    key={connector.id}
                    onClick={() => handleConnect(connector)}
                    disabled={isConnecting}
                    className={classNames(
                      "w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300",
                      "border border-white/10 hover:border-white/30",
                      isAvailable 
                        ? "bg-white/5 hover:bg-white/10 text-white hover:scale-[1.02]" 
                        : "bg-white/5 opacity-50 cursor-not-allowed text-gray-400",
                      !isAvailable && "hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-lg">
                        {icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{walletName}</div>
                        <div className="text-xs text-gray-400">
                          {isAvailable ? 'Ready to connect' : 'Install to continue'}
                        </div>
                      </div>
                    </div>
                    
                    {isConnecting ? (
                      <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : isAvailable ? (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    ) : (
                      <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                        Install
                      </span>
                    )}
                  </button>
                );
              })}
              
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  New to Starknet? 
                  <a 
                    href="https://www.starknet.io/en/ecosystem/wallets" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 ml-1 underline"
                  >
                    Learn more about wallets
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function WalletConnector() {
  const { address } = useAccount();
  return address ? <WalletConnected /> : <ConnectWallet />;
}
