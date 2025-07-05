'use client';

import Link from 'next/link';
import WalletConnector from './WalletConnector';

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

const Navbar = ({ className = '' }: NavbarProps) => {
  return (
    <div className={`
      relative backdrop-blur-xl bg-gradient-to-r from-purple-900/30 via-black/20 to-blue-900/30 
      border-b border-purple-500/40 shadow-2xl shadow-purple-500/30 z-40 ${className}
    `}>
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/15 via-transparent to-blue-600/15 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none"></div>
      
      <div className="relative navbar max-w-7xl mx-auto flex items-center justify-between">
        <div className="navbar-start flex items-center">
          <Logo />
        </div>
        
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 space-x-2 flex-row">
            <li>
              <Link 
                href="/leaderboard" 
                className="
                  font-medium px-4 py-2 rounded-lg
                  hover:bg-white/10 backdrop-blur-sm border border-transparent
                  hover:border-white/20 transition-all duration-300
                  hover:shadow-lg hover:shadow-yellow-500/20
                  relative group overflow-hidden
                "
              >
                <span className="relative z-10 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent group-hover:from-yellow-300 group-hover:via-orange-400 group-hover:to-red-400 transition-all duration-300">
                  Leaderboard
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/0 via-yellow-600/20 to-yellow-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="navbar-end flex items-center space-x-3">
          {/* Mobile menu dropdown */}
          <div className="dropdown dropdown-end lg:hidden">
            <div 
              tabIndex={0} 
              role="button" 
              className="
                btn btn-ghost text-gray-200 hover:text-white hover:bg-white/10 
                border border-white/10 hover:border-white/20 backdrop-blur-sm
                transition-all duration-300
              "
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <ul 
              tabIndex={0} 
              className="
                menu menu-sm dropdown-content mt-3 z-50 p-3 shadow-2xl
                bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl w-52
                shadow-purple-500/20
              "
            >
              <li>
                <Link 
                  href="/game" 
                  className="
                    hover:bg-white/10 rounded-lg
                    transition-all duration-300 border border-transparent hover:border-white/20
                  "
                >
                  <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                    Game
                  </span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/leaderboard" 
                  className="
                    hover:bg-white/10 rounded-lg
                    transition-all duration-300 border border-transparent hover:border-white/20
                  "
                >
                  <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Leaderboard
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          <WalletConnector />
        </div>
      </div>
    </div>
  );
};

export default Navbar; 