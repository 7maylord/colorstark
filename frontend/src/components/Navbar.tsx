"use client";

import Link from "next/link";
import WalletConnectButton from "./WalletConnectButton";

const Logo = () => (
  <Link href="/" className="flex items-center space-x-3 group relative">
    <div className="flex items-center space-x-1">
      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-pink-400 group-hover:to-red-400 transition-all duration-300 animate-glow">
        Color
      </span>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-teal-500 to-green-500 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:via-teal-400 group-hover:to-green-400 transition-all duration-300 animate-glow">
        Stark
      </span>
      {/* Sparkle icon */}
      <span className="ml-1 animate-pulse text-yellow-300 text-lg">✨</span>
    </div>
  </Link>
);

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className = "" }: NavbarProps) => {
  return (
    <nav className={`w-full bg-gradient-to-r from-white/20 via-purple-200/20 to-blue-200/20 backdrop-blur-xl border-b border-purple-500/30 shadow-xl z-40 ${className} relative`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4 py-2">
        <div className="flex items-center flex-shrink-0">
          <Logo />
        </div>
        <div className="flex-1 flex justify-center">
          <Link href="/leaderboard" className="font-medium px-4 py-2 rounded-lg relative group transition-all duration-200 text-center">
            <span className="relative z-10">Leaderboard</span>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-1 -mb-1 w-0 group-hover:w-4/5 h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 rounded-full transition-all duration-300 opacity-80" />
          </Link>
        </div>
        <div className="flex items-center flex-shrink-0">
          <WalletConnectButton />
        </div>
      </div>
      <style jsx global>{`
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 8px #fff, 0 0 16px #a78bfa, 0 0 32px #f472b6; }
          50% { text-shadow: 0 0 16px #fff, 0 0 32px #a78bfa, 0 0 64px #f472b6; }
        }
        .animate-glow {
          animation: glow 2.5s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 1.5s infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </nav>
  );
};

export default Navbar; 