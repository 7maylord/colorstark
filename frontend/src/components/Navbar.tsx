"use client";

import Link from "next/link";
import WalletConnectButton from "./WalletConnectButton";

const Logo = () => (
  <Link href="/" className="flex items-center space-x-3 group">
    <div className="flex items-center space-x-1">
      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-pink-400 group-hover:to-red-400 transition-all duration-300">
        Color
      </span>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-teal-500 to-green-500 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:via-teal-400 group-hover:to-green-400 transition-all duration-300">
        Stark
      </span>
    </div>
  </Link>
);

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className = "" }: NavbarProps) => {
  return (
    <nav className={`w-full bg-gradient-to-r from-purple-900/60 to-blue-900/60 border-b border-purple-500/30 shadow z-40 ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center flex-shrink-0">
          <Logo />
        </div>
        <div className="flex-1 flex justify-center">
          <Link href="/leaderboard" className="font-medium px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-center">
            Leaderboard
          </Link>
        </div>
        <div className="flex items-center flex-shrink-0">
          <WalletConnectButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 