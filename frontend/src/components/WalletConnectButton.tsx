"use client";

import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useStarknetkitConnectModal } from "starknetkit";
import { useMemo, useState, useRef, useEffect } from "react";

// Utility for class names
const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

export default function WalletConnectButton() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { starknetkitConnectModal } = useStarknetkitConnectModal({ connectors });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Copy address to clipboard
  const copyToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 2000);
    }
  };

  // Modal wallet icons
  const walletIcons: Record<string, string> = {
    argentx: "🦊",
    braavos: "🛡️",
    defaultIcon: "💼"
  };

  // Modal connect handler
  const handleConnect = async (connector: any) => {
    setIsConnecting(true);
    try {
      if (!connector.available()) {
        window.open("https://www.starknet.io/en/ecosystem/wallets", "_blank");
        return;
      }
      await connect({ connector });
      setIsModalOpen(false);
    } catch (e) {
      // handle error
    } finally {
      setIsConnecting(false);
    }
  };

  // Dropdown close on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Connected UI
  if (address) {
    const shortened = `${address.slice(0, 6)}...${address.slice(-4)}`;
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((open) => !open)}
          className="relative px-4 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-starknet-600 to-purple-600 hover:from-starknet-500 hover:to-purple-500 text-white shadow-lg hover:shadow-purple-500/25 border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 flex items-center space-x-2 group overflow-hidden"
        >
          <span className="font-mono">{shortened}</span>
          {justCopied ? (
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          <svg className={classNames("w-4 h-4 ml-1 transition-transform duration-300", dropdownOpen ? "rotate-180" : "")}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 z-50 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl shadow-purple-500/20 animate-fade-in p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Wallet Address</span>
                <button onClick={copyToClipboard} className="p-1 rounded hover:bg-white/10 transition">
                  {justCopied ? (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 font-mono text-white text-sm break-all select-all">
                {address}
              </div>
              <button
                onClick={() => { disconnect(); setDropdownOpen(false); }}
                className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm">Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Not connected: show connect button and modal
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative px-6 py-2.5 rounded-xl font-medium text-sm bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white shadow-lg hover:shadow-purple-500/25 border border-white/20 hover:border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 active:scale-95 flex items-center space-x-2 group overflow-hidden"
      >
        <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <span className="relative z-10">Connect Wallet</span>
      </button>
      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '16px'
          }}
          onClick={e => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full overflow-hidden animate-slide-up" style={{ maxWidth: '400px', width: '100%' }}>
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
                      <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">Install</span>
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
        </div>
      )}
    </>
  );
} 